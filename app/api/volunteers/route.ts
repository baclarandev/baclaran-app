import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { z } from "zod";
import { generateVolunteerCode } from "@/app/lib/generate-volunteer-code";

const currentYear = new Date().getFullYear();

/* ================= SCHEMAS ================= */

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
  ministryIds: z.array(z.number()).optional(),
  sacraments: z.array(z.any()).optional(),
  joinedYear: z.number().int().min(1900).max(currentYear).optional(),
  formations: z.array(FormationSchema).optional(),
  timelines: z.array(TimelineSchema).optional(),
});

/* ================= RESPONSE SCHEMA ================= */

const VolunteerResponseSchema = z.object({
  id: z.number(),
  volunteerCode: z.string(),
  joinedYear: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  middleInitial: z.string().nullable().optional(),
  nickname: z.string().nullable().optional(),
  email: z.string(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  dateOfBirth: z.date().nullable().optional(),
  sex: z.string(),
  civilStatus: z.string(),
  occupation: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  profilePicture: z.string().nullable().optional(),
});

/* ================= GET ================= */

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSession();

    if (!sessionUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!can.isStaff(sessionUser))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Build filter based on role
    const where: any = {};

    // If user is staff, restrict to their ministry
    if (sessionUser.role === "STAFF") {
      if (!sessionUser.ministryId)
        return NextResponse.json(
          { error: "Staff has no ministry assigned" },
          { status: 403 },
        );

      where.ministryHistories = {
        some: { ministryId: sessionUser.ministryId },
      };
    }

    const volunteers = await prisma.volunteer.findMany({
      where,
      orderBy: { joinedYear: "desc" },
      select: {
        id: true,
        volunteerCode: true,
        joinedYear: true,
        firstName: true,
        lastName: true,
        middleInitial: true,
        nickname: true,
        email: true,
        phone: true,
        address: true,
        dateOfBirth: true,
        sex: true,
        civilStatus: true,
        occupation: true,
        status: true,
        profilePicture: true,
      },
    });

    const parsedVolunteers = volunteers.map((v) =>
      VolunteerResponseSchema.parse({
        ...v,
        joinedYear: v.joinedYear ? String(v.joinedYear) : "N/A",
      }),
    );

    return NextResponse.json({ data: parsedVolunteers });
  } catch (error: any) {
    console.error("[GET_VOLUNTEERS_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch volunteers" },
      { status: 500 },
    );
  }
}

/* ================= POST ================= */

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!can.isStaff(sessionUser))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const parsed = CreateVolunteerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid volunteer data", details: parsed.error.format() },
        { status: 400 },
      );
    }

    let {
      formations = [],
      timelines = [],
      ministryIds,
      dateOfBirth,
      joinedYear: selectedYear, // <- get user-selected year
      ...data
    } = parsed.data;

    // Force staff ministry
    if (sessionUser.role === "STAFF") {
      if (!sessionUser.ministryId)
        return NextResponse.json(
          { error: "Staff has no ministry assigned" },
          { status: 403 },
        );
      ministryIds = [sessionUser.ministryId];
    }

    if (!ministryIds || ministryIds.length === 0) {
      return NextResponse.json({ error: "Ministry required" }, { status: 400 });
    }

    const targetMinistryId = ministryIds[0];

    // Check duplicate email
    const existing = await prisma.volunteer.findUnique({
      where: { email: data.email },
    });
    if (existing)
      return NextResponse.json(
        { error: "Volunteer email already exists." },
        { status: 400 },
      );

    // Generate volunteer code using selected year
    const { volunteerCode, joinedYear } = await generateVolunteerCode(
      targetMinistryId,
      selectedYear ? String(selectedYear) : undefined, // <-- pass selected year
    );

    // Create volunteer
    const volunteer = await prisma.volunteer.create({
      data: {
        volunteerCode,
        joinedYear,
        ...data,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,

        ministryHistories: {
          create: {
            ministryId: targetMinistryId,
            status: "ACTIVE",
          },
        },

        ...(formations.length > 0 && {
          formations: { createMany: { data: formations } },
        }),

        ...(timelines.length > 0 && {
          timelines: {
            createMany: {
              data: timelines.map((t) => ({
                ...t,
                totalYears: (t.endYear ?? currentYear) - t.startYear + 1,
              })),
            },
          },
        }),
      },
    });

    return NextResponse.json(
      { message: "Volunteer created successfully", data: volunteer },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("[CREATE_VOLUNTEER_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create volunteer" },
      { status: 500 },
    );
  }
}
