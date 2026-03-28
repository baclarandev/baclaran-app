import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateVolunteerCode } from "@/app/lib/generate-volunteer-code";
import { getRootMinistryId } from "@/lib/get-root-ministry";

const currentYear = new Date().getFullYear();

// ---------------- GET SINGLE VOLUNTEER ----------------
export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const id = Number((await params).id);
    if (!id || isNaN(id))
      return NextResponse.json(
        { error: "Invalid volunteer ID" },
        { status: 400 },
      );

    const volunteer = await prisma.volunteer.findUnique({
      where: { id },
      include: {
        formations: true,
        timelines: true,
        ministryHistories: {
          where: { status: "ACTIVE" },
          include: { ministry: true },
          orderBy: { joinedAt: "desc" },
        },
      },
    });

    if (!volunteer)
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404 },
      );

    return NextResponse.json({
      ...volunteer,
      ministryName:
        volunteer.ministryHistories[0]?.ministry?.name ?? "No Ministry",
    });
  } catch (err: any) {
    console.error("[GET_VOLUNTEER_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to fetch volunteer" },
      { status: 500 },
    );
  }
}

// ---------------- PATCH (partial update) ----------------
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const sessionUser = await getSession();

  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await context.params;
    const volunteerId = Number(params.id);

    if (!volunteerId || isNaN(volunteerId)) {
      return NextResponse.json(
        { error: "Invalid volunteer ID" },
        { status: 400 },
      );
    }

    // ================= FETCH VOLUNTEER =================
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
      include: {
        ministryHistories: {
          where: { status: "ACTIVE" },
        },
      },
    });

    if (!volunteer) {
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404 },
      );
    }

    // ================= AUTHORIZATION =================
    const volunteerMinistryId = volunteer.ministryHistories[0]?.ministryId;

    const isAdmin = sessionUser.role === "ADMIN";
    const isStaffOfSameMinistry =
      sessionUser.role === "STAFF" &&
      sessionUser.ministryId === volunteerMinistryId;

    if (!isAdmin && !isStaffOfSameMinistry) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data: any = {};

    // ================= BASIC FIELDS =================
    if (body.firstName !== undefined) data.firstName = body.firstName;
    if (body.lastName !== undefined) data.lastName = body.lastName;
    if (body.middleInitial !== undefined)
      data.middleInitial = body.middleInitial;
    if (body.nickname !== undefined) data.nickname = body.nickname;
    if (body.email !== undefined) data.email = body.email;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.address !== undefined) data.address = body.address;
    if (body.profilePicture !== undefined)
      data.profilePicture = body.profilePicture;
    if (body.sex !== undefined) data.sex = body.sex;
    if (body.civilStatus !== undefined) data.civilStatus = body.civilStatus;
    if (body.occupation !== undefined) data.occupation = body.occupation;
    if (body.status !== undefined) data.status = body.status;
    if (body.sacraments !== undefined) data.sacraments = body.sacraments;

    if (body.dateOfBirth !== undefined) {
      data.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    }

    // ================= CLASSIFICATION =================
    if (body.classification !== undefined) {
      data.classification = body.classification;
    }

    if (body.volunteerClassification !== undefined) {
      data.volunteerClassification = body.volunteerClassification;
    }

    // ================= YEARS =================
    // ✅ DO NOT regenerate volunteerCode here
    if (body.joinedYearShrine !== undefined) {
      data.joinedYearShrine = body.joinedYearShrine;
    }

    if (body.joinedYearMinistry !== undefined) {
      data.joinedYearMinistry = body.joinedYearMinistry;
    }

    // ================= TIMELINES =================
    if (body.timelines !== undefined && Array.isArray(body.timelines)) {
      data.timelines = {
        deleteMany: { volunteerId },
        createMany: {
          data: body.timelines.map((t: any) => ({
            ...t,
            totalYears: (t.endYear ?? currentYear) - t.startYear + 1,
          })),
        },
      };
    }

    // ================= UPDATE =================
    const updated = await prisma.volunteer.update({
      where: { id: volunteerId },
      data,
      include: {
        timelines: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("[PATCH_VOLUNTEER_ERROR]", err);

    return NextResponse.json(
      { error: "Failed to update volunteer" },
      { status: 500 },
    );
  }
}

// ---------------- PUT (full update) ----------------
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const id = Number((await params).id);

    if (!id || isNaN(id))
      return NextResponse.json(
        { error: "Invalid volunteer ID" },
        { status: 400 },
      );

    const body = await req.json();
    if (!body.firstName || !body.lastName || !body.email)
      return NextResponse.json(
        { error: "firstName, lastName, email required" },
        { status: 400 },
      );

    const volunteer = await prisma.volunteer.findUnique({
      where: { id },
      include: { ministryHistories: true }, // ✅ include relations
    });

    const data: any = {
      firstName: body.firstName,
      lastName: body.lastName,
      middleInitial: body.middleInitial ?? null,
      nickname: body.nickname ?? null,
      email: body.email,
      phone: body.phone ?? null,
      address: body.address ?? null,
      sex: body.sex,
      occupation: body.occupation ?? null,
      profilePicture: body.profilePicture ?? null,
      status: body.status ?? "ACTIVE",
      sacraments: body.sacraments ?? [],
      volunteerClassification: body.volunteerClassification ?? "REGULAR",
      joinedYearShrine: body.joinedYearShrine ?? currentYear,
      joinedYearMinistry: body.joinedYearMinistry ?? currentYear,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      classification: body.volunteerClassification ?? "REGULAR",
    };

    // Update timelines if provided
    if (body.timelines !== undefined && Array.isArray(body.timelines)) {
      data.timelines = {
        deleteMany: { volunteerId: id },
        createMany: {
          data: body.timelines.map((t: any) => ({
            ...t,
            totalYears: (t.endYear ?? currentYear) - t.startYear + 1,
          })),
        },
      };
    }

    // Re-generate volunteerCode for PUT
    if (volunteer && volunteer.ministryHistories?.length) {
      const rootMinistryId = await getRootMinistryId(
        volunteer.ministryHistories[0].ministryId,
      );
      const { volunteerCode } = await generateVolunteerCode(
        rootMinistryId,
        body.joinedYearShrine ?? currentYear,
      );
      data.volunteerCode = volunteerCode;
    }

    const updated = await prisma.volunteer.update({
      where: { id },
      data,
      include: { timelines: true },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("[UPDATE_VOLUNTEER_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to update volunteer" },
      { status: 500 },
    );
  }
}

// ---------------- DELETE ----------------
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const id = Number((await params).id);

    if (!id || isNaN(id))
      return NextResponse.json(
        { error: "Invalid volunteer ID" },
        { status: 400 },
      );

    const volunteer = await prisma.volunteer.findUnique({ where: { id } });
    if (!volunteer)
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404 },
      );

    await prisma.volunteer.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Volunteer archived successfully",
    });
  } catch (err: any) {
    console.error("[ARCHIVE_VOLUNTEER_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to archive volunteer" },
      { status: 500 },
    );
  }
}
