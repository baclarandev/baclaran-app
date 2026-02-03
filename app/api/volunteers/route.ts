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

  // ✅ NEW
  formations: z.array(FormationSchema).optional(),
  timelines: z.array(TimelineSchema).optional(),
});
// GET /api/volunteers - Fetch all volunteers with ministry info
export async function GET() {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json(
      { error: "Unauthorized: No session found" },
      { status: 401 },
    );
  }

  try {
    const volunteers = await prisma.volunteer.findMany({
      where: {
        status: "ACTIVE", // ✅ IMPORTANT
      },
      include: {
        ministryHistories: {
          where: {
            status: "ACTIVE",
          },
          include: {
            ministry: true,
          },
          orderBy: {
            joinedAt: "desc",
          },
          take: 1, // latest active ministry
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const transformedVolunteers = volunteers.map((volunteer: any) => ({
      id: volunteer.id,
      volunteerCode: volunteer.volunteerCode,
      firstName: volunteer.firstName,
      lastName: volunteer.lastName,
      middleInitial: volunteer.middleInitial,
      nickname: volunteer.nickname,
      email: volunteer.email,
      phone: volunteer.phone,
      address: volunteer.address,
      dateOfBirth: volunteer.dateOfBirth,
      sex: volunteer.sex,
      civilStatus: volunteer.civilStatus,
      occupation: volunteer.occupation,
      status: volunteer.status,
      profilePicture: volunteer.profilePicture,
      createdAt: volunteer.createdAt,
      sacraments: volunteer.sacraments,

      // ✅ safe ministry display
      ministryName:
        volunteer.ministryHistories[0]?.ministry?.name ?? "No Ministry",
    }));

    return NextResponse.json(transformedVolunteers);
  } catch (error) {
    console.error("[GET_VOLUNTEERS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteers" },
      { status: 500 },
    );
  }
}

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

    // ✅ Default optional arrays to empty arrays
    const {
      formations = [],
      timelines = [],
      ministryIds,
      dateOfBirth,
      ...data
    } = parsed.data;

    // 🔢 Volunteer Code
    const lastVolunteer = await prisma.volunteer.findFirst({
      orderBy: { id: "desc" },
    });

    const nextCode = lastVolunteer
      ? String(parseInt(lastVolunteer.volunteerCode) + 1).padStart(6, "0")
      : "100000";

    const volunteer = await prisma.volunteer.create({
      data: {
        volunteerCode: nextCode,
        ...data,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,

        // ✅ Ministries
        ministryHistories:
          ministryIds && ministryIds.length > 0
            ? {
                createMany: {
                  data: ministryIds.map((id) => ({
                    ministryId: id,
                    status: "ACTIVE",
                  })),
                },
              }
            : undefined,

        // ✅ Formations
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

        // ✅ Timelines
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
      {
        message: "Volunteer created successfully",
        data: volunteer,
      },
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
