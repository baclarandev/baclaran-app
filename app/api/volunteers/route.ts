import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";

// GET /api/volunteers - Fetch all volunteers with ministry info
export async function GET() {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json(
      { error: "Unauthorized: No session found" },
      { status: 401 }
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

    const transformedVolunteers = volunteers.map((volunteer) => ({
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
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Unauthorized: No session found" },
        { status: 401 }
      );
    }
    if (!can.isChairman(sessionUser)) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to create volunteers" },
        { status: 403 }
      );
    }
    const body = await request.json();
    const {
      firstName,
      lastName,
      middleInitial,
      nickname,
      email,
      phone,
      address,
      dateOfBirth,
      sex,
      civilStatus,
      occupation,
      status = "ACTIVE",
      profilePicture,
      ministryIds,
      sacraments = [],
    } = body;
    if (!firstName || !lastName || !email || !sex || !civilStatus) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const lastVolunteer = await prisma.volunteer.findFirst({
      orderBy: { id: "desc" },
    });
    const nextCode = lastVolunteer
      ? String(parseInt(lastVolunteer.volunteerCode) + 1).padStart(6, "0")
      : "100000";
    const volunteer = await prisma.volunteer.create({
      data: {
        volunteerCode: nextCode,
        firstName,
        lastName,
        middleInitial: middleInitial || undefined,
        nickname: nickname || undefined,
        email,
        phone: phone || undefined,
        address: address || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        sex,
        civilStatus,
        occupation: occupation || undefined,
        status,
        profilePicture: profilePicture || undefined,
        sacraments,
        ministryHistories:
          ministryIds && ministryIds.length > 0
            ? {
                createMany: {
                  data: ministryIds.map((id: number) => ({
                    ministryId: id,
                    status: "ACTIVE",
                  })),
                },
              }
            : undefined,
      },
    });
    return NextResponse.json(
      { message: "Volunteer created successfully", data: volunteer },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[CREATE_VOLUNTEER_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create volunteer" },
      { status: 500 }
    );
  }
}
