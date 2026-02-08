import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { z } from "zod";

const currentYear = new Date().getFullYear();

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
  .refine((d) => !d.endYear || d.endYear >= d.startYear, { path: ["endYear"] });

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
  formations: z.array(FormationSchema).optional(),
  timelines: z.array(TimelineSchema).optional(),
});

// GET /api/volunteers - Fetch all volunteers with ministry info
export async function GET() {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const whereClause: any = {
    status: "ACTIVE",
  };

  // 🔐 Staff can only see their own ministry
  if (!can.isAdmin(sessionUser)) {
    if (!sessionUser.ministryId) {
      return NextResponse.json([], { status: 200 });
    }

    whereClause.ministryHistories = {
      some: {
        ministryId: sessionUser.ministryId,
        status: "ACTIVE",
      },
    };
  }

  const volunteers = await prisma.volunteer.findMany({
    where: whereClause,
    include: {
      ministryHistories: {
        where: { status: "ACTIVE" },
        include: { ministry: true },
        orderBy: { joinedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const transformedVolunteers = volunteers.map((v) => ({
    id: v.id,
    volunteerCode: v.volunteerCode,
    firstName: v.firstName,
    lastName: v.lastName,
    email: v.email,
    status: v.status,
    profilePicture: v.profilePicture,
    ministryId: v.ministryHistories[0]?.ministryId ?? null, // ✅ IMPORTANT
    ministryName: v.ministryHistories[0]?.ministry?.name ?? "No Ministry",
  }));

  return NextResponse.json(transformedVolunteers);
}

// POST /api/volunteers - Create a new volunteer
export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Unauthorized: No session found" },
        { status: 401 },
      );
    }

    if (!can.isStaff(sessionUser)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = CreateVolunteerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid volunteer data", details: parsed.error },
        { status: 400 },
      );
    }

    // Default optional arrays to empty arrays
    const {
      formations = [],
      timelines = [],
      ministryIds,
      dateOfBirth,
      ...data
    } = parsed.data;

    // Determine ministry for this volunteer
    let targetMinistryId: number;

    if (can.isAdmin(sessionUser)) {
      // Admin can pick ministry
      if (!ministryIds || ministryIds.length === 0) {
        return NextResponse.json(
          { error: "Admin must select at least one ministry" },
          { status: 400 },
        );
      }
      targetMinistryId = ministryIds[0];
    } else {
      // Staff can only add to their own ministry
      if (!sessionUser.ministryId) {
        return NextResponse.json(
          { error: "Staff user is not assigned to any ministry" },
          { status: 403 },
        );
      }
      targetMinistryId = sessionUser.ministryId;
    }

    const ministry = await prisma.ministry.findUnique({
      where: { id: targetMinistryId },
    });

    if (!ministry) {
      return NextResponse.json(
        { error: "Selected ministry does not exist." },
        { status: 400 },
      );
    }

    // Count existing volunteers in this ministry
    const lastVolunteerInMinistry =
      await prisma.volunteerMinistryHistory.findFirst({
        where: { ministryId: targetMinistryId },
        orderBy: { id: "desc" },
        include: { volunteer: true }, // <-- add this
      });

    const nextNumber = lastVolunteerInMinistry
      ? parseInt(
          lastVolunteerInMinistry.volunteer.volunteerCode.split("-")[1],
        ) + 1
      : 1;

    const volunteerCode = `${ministry.name
      .split(" ")
      .map((w) => w[0])
      .join("")}-${String(nextNumber).padStart(4, "0")}`; // e.g., MOC-0001

    // Check for duplicate email BEFORE creating
    const existing = await prisma.volunteer.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A volunteer with this email already exists." },
        { status: 400 },
      );
    }

    // Create new volunteer
    const volunteer = await prisma.volunteer.create({
      data: {
        volunteerCode,
        ...data,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,

        // Assign ministry
        ministryHistories: {
          create: {
            ministryId: targetMinistryId,
            status: "ACTIVE",
          },
        },

        // Formations
        ...(formations.length > 0 && {
          formations: {
            createMany: {
              data: formations.map((f) => ({
                name: f.name,
                year: f.year,
              })),
            },
          },
        }),

        // Timelines
        ...(timelines.length > 0 && {
          timelines: {
            createMany: {
              data: timelines.map((t) => ({
                organization: t.organization,
                startYear: t.startYear,
                endYear: t.endYear,
                totalYears: (t.endYear ?? currentYear) - t.startYear + 1,
                type: t.type,
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
