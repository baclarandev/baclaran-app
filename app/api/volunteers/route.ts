import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { z } from "zod";

import { SacramentName } from "@prisma/client";

const currentYear = new Date().getFullYear();

/* ================= ENUMS ================= */
export enum VolunteerClassification {
  REGULAR = "REGULAR",
  SEASONAL = "SEASONAL",
  EMERITUS = "EMERITUS",
}

/* ================= SCHEMAS ================= */
const FormationSchema = z.object({
  name: z.string().min(1),
  year: z.coerce.number().int().min(1900).max(currentYear),
});

// const TimelineSchema = z
//   .object({
//     organization: z.string().min(1),
//     startYear: z.coerce.number().int().min(1900).max(currentYear),
//     endYear: z.coerce.number().int().min(1900).max(currentYear).optional(),
//     type: z.enum(["SHRINE", "OUTSIDE"]),
//     parish: z.string().optional(),
//   })
//   .refine((d) => !d.endYear || d.endYear >= d.startYear, {
//     message: "endYear must be greater than or equal to startYear",
//     path: ["endYear"],
//   });

const CreateVolunteerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  middleInitial: z.string().optional(),
  nickname: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  sex: z.string(),
  civilStatus: z.string(),
  occupation: z.string().optional(),
  status: z.string().optional(),
  profilePicture: z.string().optional(),
  classification: z.enum(VolunteerClassification).optional(),
  ministryIds: z.array(z.number()).min(1),
  subMinistryId: z.number().optional(),
  sacraments: z.array(z.nativeEnum(SacramentName)).optional(),
  joinedYearShrine: z.coerce
    .number()
    .int()
    .min(1900)
    .max(currentYear)
    .optional(),
  joinedYearMinistry: z.coerce
    .number()
    .int()
    .min(1900)
    .max(currentYear)
    .optional(),
  formations: z.array(FormationSchema).optional(),
  timelines: z.array(z.any()).optional(),
});
async function generateVolunteerCode(
  tx: any,
  ministryCode: string,
  joinedYearShrine: number,
  parentMinistryId: number,
) {
  const groupKey = `GROUP-${parentMinistryId}`;

  // Try to find existing sequence
  let seq = await tx.volunteerCodeSequence.findUnique({
    where: { groupKey },
  });

  let nextNumber = 1;

  if (seq) {
    // Sequence exists → increment manually
    nextNumber = seq.lastValue + 1;

    await tx.volunteerCodeSequence.update({
      where: { groupKey },
      data: { lastValue: nextNumber },
    });
  } else {
    // Sequence does not exist → create starting at 1
    await tx.volunteerCodeSequence.create({
      data: { groupKey, lastValue: nextNumber },
    });
  }

  const padded = nextNumber.toString().padStart(4, "0");
  return `${ministryCode}-${joinedYearShrine}-${padded}`;
}
/* ================= GET VOLUNTEERS ================= */
export async function GET() {
  try {
    const sessionUser = await getSession();
    if (!sessionUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!can.isStaff(sessionUser))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // STAFF: only see their ministry + sub-ministries
    let ministryFilter: number[] | undefined;
    if (sessionUser.role === "STAFF" && sessionUser.ministryId) {
      const subMinistries = await prisma.ministry.findMany({
        where: { parentId: sessionUser.ministryId },
        select: { id: true },
      });
      ministryFilter = [
        sessionUser.ministryId,
        ...subMinistries.map((m) => m.id),
      ];
    }

    const ministryIdsToQuery = ministryFilter?.length
      ? ministryFilter
      : (await prisma.ministry.findMany({ select: { id: true } })).map(
          (m) => m.id,
        );

    if (!ministryIdsToQuery.length) return NextResponse.json({ data: [] });

    const volunteers = await prisma.volunteer.findMany({
      where: {
        ministryHistories: {
          some: {
            status: "ACTIVE",
            ministryId: { in: ministryIdsToQuery },
          },
        },
      },
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

    // Group volunteers per ministry
    const groupedByMinistry = volunteers.reduce<Record<string, any[]>>(
      (acc, v) => {
        const activeMinistry = v.ministryHistories[0]?.ministry;
        if (!activeMinistry) return acc;
        const key = `${activeMinistry.id}-${activeMinistry.name}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(v);
        return acc;
      },
      {},
    );

    const result = Object.entries(groupedByMinistry).map(([key, vols]) => {
      const [id, name] = key.split("-");
      return { id: Number(id), name, volunteers: vols };
    });

    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error("[GET_VOLUNTEERS_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch volunteers" },
      { status: 500 },
    );
  }
}

/* ================= CREATE VOLUNTEER ================= */
export async function POST(req: Request) {
  try {
    const sessionUser = await getSession();

    if (!sessionUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!can.isStaff(sessionUser))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const parsed = CreateVolunteerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const { ministryIds, subMinistryId, joinedYearShrine } = data;

    if (!joinedYearShrine) {
      return NextResponse.json(
        { error: "joinedYearShrine required" },
        { status: 400 },
      );
    }
    const normalizedEmail =
      data.email && data.email.trim() !== "" ? data.email.toLowerCase() : null;
    const mainMinistry = await prisma.ministry.findUnique({
      where: { id: ministryIds[0] },
      include: { parent: true },
    });

    if (!mainMinistry)
      return NextResponse.json(
        { error: "Main ministry not found" },
        { status: 400 },
      );

    let ministryCode = mainMinistry.ministryCode;

    if (subMinistryId) {
      const sub = await prisma.ministry.findUnique({
        where: { id: subMinistryId },
      });

      if (sub?.ministryCode) ministryCode = sub.ministryCode;
    }

    const parentMinistryId = mainMinistry.parentId || mainMinistry.id;

    const volunteer = await prisma.$transaction(async (tx) => {
      const volunteerCode = await generateVolunteerCode(
        tx,
        ministryCode!,
        joinedYearShrine,
        parentMinistryId,
      );

      return tx.volunteer.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          middleInitial: data.middleInitial,
          nickname: data.nickname,
          email: normalizedEmail,
          phone: data.phone,
          address: data.address,
          dateOfBirth: data.dateOfBirth
            ? new Date(data.dateOfBirth)
            : undefined,
          sex: data.sex,
          civilStatus: data.civilStatus,
          occupation: data.occupation,
          status: data.status || "ACTIVE",
          profilePicture: data.profilePicture,
          sacraments: data.sacraments,

          volunteerCode,

          joinedYearShrine: data.joinedYearShrine,
          joinedYearMinistry: data.joinedYearMinistry,

          classification: data.classification,

          formations: data.formations ? { create: data.formations } : undefined,

          timelines: data.timelines
            ? {
                create: data.timelines.map((t) => ({
                  ...t,
                  totalYears: t.endYear ? t.endYear - t.startYear + 1 : 1,
                })),
              }
            : undefined,

          ministryHistories: {
            create: [
              {
                ministryId: subMinistryId || ministryIds[0],
                joinedAt: new Date(),
                status: "ACTIVE",
              },
            ],
          },
        },
        include: {
          ministryHistories: { include: { ministry: true } },
          formations: true,
          timelines: true,
        },
      });
    });

    return NextResponse.json({ volunteer }, { status: 201 });
  } catch (error: any) {
    console.error("[CREATE_VOLUNTEER_ERROR]", error);

    return NextResponse.json(
      { error: error.message || "Failed to create volunteer" },
      { status: 500 },
    );
  }
}
