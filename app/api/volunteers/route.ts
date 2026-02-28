import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { z } from "zod";
import { generateVolunteerCode } from "@/app/lib/generate-volunteer-code";
import { SacramentName } from "@prisma/client";
import { getRootMinistryId } from "@/lib/get-root-ministry";

const currentYear = new Date().getFullYear();

/* ================= SCHEMAS ================= */
export enum VolunteerClassification {
  REGULAR = "REGULAR",
  SEASONAL = "SEASONAL",
}

const FormationSchema = z.object({
  name: z.string().min(1),
  year: z.number().int().min(1900).max(currentYear),
});

const TimelineSchema = z
  .object({
    organization: z.string().min(1),
    startYear: z.number().int().min(1900).max(currentYear),
    endYear: z.number().int().min(1900).max(currentYear).optional(),
    type: z.enum(["SHRINE", "OUTSIDE"]),
    parish: z.string().optional(),
  })
  .refine((d) => !d.endYear || d.endYear >= d.startYear, {
    message: "endYear must be greater than or equal to startYear",
    path: ["endYear"],
  });

const CreateVolunteerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  middleInitial: z.string().optional(),
  nickname: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  sex: z.string(),
  civilStatus: z.string(),
  occupation: z.string().optional(),
  status: z.string().optional(),
  profilePicture: z.string().optional(),
  volunteerClassification: z.enum(VolunteerClassification).optional(),
  ministryIds: z.array(z.number()).min(1),
  subMinistryId: z.number().optional(),
  sacraments: z.array(z.nativeEnum(SacramentName)).optional(),
  joinedYearShrine: z.number().int().min(1900).max(currentYear).optional(),
  joinedYearMinistry: z.number().int().min(1900).max(currentYear).optional(),
  formations: z.array(FormationSchema).optional(),
  timelines: z.array(TimelineSchema).optional(),
});

/* ===================================================== */
/* ======================== GET ========================= */
/* ===================================================== */
export async function GET() {
  try {
    const sessionUser = await getSession();
    if (!sessionUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!can.isStaff(sessionUser))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const where: any = {};

    // STAFF: see their ministry + sub-ministries only
    if (sessionUser.role === "STAFF") {
      if (!sessionUser.ministryId)
        return NextResponse.json(
          { error: "Staff has no ministry assigned" },
          { status: 403 },
        );

      const subMinistries = await prisma.ministry.findMany({
        where: { parentId: sessionUser.ministryId },
        select: { id: true },
      });

      const ministryIds = [
        sessionUser.ministryId,
        ...subMinistries.map((m) => m.id),
      ];

      where.ministryHistories = {
        some: { ministryId: { in: ministryIds }, status: "ACTIVE" },
      };
    }

    const volunteers = await prisma.volunteer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        ministryHistories: {
          where: { status: "ACTIVE" },
          include: { ministry: true },
        },
        formations: true,
        timelines: true,
      },
    });

    return NextResponse.json({ data: volunteers });
  } catch (error: any) {
    console.error("[GET_VOLUNTEERS_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch volunteers" },
      { status: 500 },
    );
  }
}

/* ===================================================== */
/* ======================== POST ======================== */
/* ===================================================== */
export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!can.isStaff(sessionUser))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const parsed = CreateVolunteerSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid volunteer data", details: parsed.error.format() },
        { status: 400 },
      );

    const {
      formations = [],
      timelines = [],
      ministryIds,
      subMinistryId,
      dateOfBirth,
      joinedYearShrine: selectedYear,
      joinedYearMinistry,
      volunteerClassification,
      ...data
    } = parsed.data;

    let parentMinistryId = ministryIds[0];
    if (sessionUser.role === "STAFF")
      parentMinistryId = sessionUser.ministryId!;
    let finalMinistryId = parentMinistryId;

    if (subMinistryId) {
      const sub = await prisma.ministry.findUnique({
        where: { id: subMinistryId },
      });
      if (!sub || sub.parentId !== parentMinistryId)
        return NextResponse.json(
          { error: "Invalid sub-ministry selected." },
          { status: 400 },
        );
      finalMinistryId = subMinistryId;
    }

    const existingEmail = await prisma.volunteer.findUnique({
      where: { email: data.email },
    });
    if (existingEmail)
      return NextResponse.json(
        { error: "Volunteer email already exists." },
        { status: 400 },
      );

    // Generate volunteerCode
    const rootMinistryId = await getRootMinistryId(finalMinistryId);
    const { volunteerCode, joinedYear } = await generateVolunteerCode(
      rootMinistryId,
      selectedYear ?? undefined,
    );

    const volunteer = await prisma.volunteer.create({
      data: {
        ...data,
        volunteerCode,
        joinedYearShrine: joinedYear,
        joinedYearMinistry: joinedYearMinistry ?? null,
        classification: parsed.data.volunteerClassification ?? "REGULAR",
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        ministryHistories: {
          create: { ministryId: finalMinistryId, status: "ACTIVE" },
        },
        ...(formations.length && {
          formations: { createMany: { data: formations } },
        }),
        ...(timelines.length && {
          timelines: {
            createMany: {
              data: timelines.map((t) => ({
                organization: t.organization,
                startYear: t.startYear,
                endYear: t.endYear,
                type: t.type,
                parish: t.parish, // ← explicitly
                totalYears: (t.endYear ?? currentYear) - t.startYear + 1,
              })),
            },
          },
        }),
      },
      include: {
        ministryHistories: { include: { ministry: true } },
        formations: true,
        timelines: true,
      },
    });

    return NextResponse.json(
      { message: "Volunteer created successfully", data: volunteer },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[CREATE_VOLUNTEER_ERROR]", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Volunteer code already exists. Please retry." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create volunteer" },
      { status: 500 },
    );
  }
}
