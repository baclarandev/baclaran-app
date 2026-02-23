import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
    const id = Number(params.id);
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
      joinedYear: volunteer.joinedYear ?? new Date().getFullYear().toString(),
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

    // 🔍 Fetch volunteer + active ministry
    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
      include: {
        ministryHistories: {
          where: { status: "ACTIVE" },
          include: { ministry: true },
        },
      },
    });

    if (!volunteer) {
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404 },
      );
    }

    const volunteerMinistryId = volunteer.ministryHistories[0]?.ministryId;

    // 🔐 AUTHORIZATION
    const isAdmin = sessionUser.role === "ADMIN";
    const isStaffOfSameMinistry =
      sessionUser.role === "STAFF" &&
      sessionUser.ministryId === volunteerMinistryId;

    if (!isAdmin && !isStaffOfSameMinistry) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ Partial update payload
    const body = await req.json();
    const data: any = {};

    if (body.firstName !== undefined) data.firstName = body.firstName;
    if (body.lastName !== undefined) data.lastName = body.lastName;
    if (body.email !== undefined) data.email = body.email;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.address !== undefined) data.address = body.address;
    if (body.profilePicture !== undefined)
      data.profilePicture = body.profilePicture;
    if (body.nickname !== undefined) data.nickname = body.nickname;
    if (body.dateOfBirth) {
      data.dateOfBirth = new Date(body.dateOfBirth);
    }
    if (body.joinedYear !== undefined) {
      data.joinedYear = body.joinedYear.toString();
    }
    if (body.joinedYear !== undefined) {
      data.joinedYear = body.joinedYear.toString();

      // Generate volunteerCode: SC-{joinedYear}-{ID padded 4 digits}
      data.volunteerCode = `SC-${data.joinedYear}-${volunteerId
        .toString()
        .padStart(4, "0")}`;
    }
    const updated = await prisma.volunteer.update({
      where: { id: volunteerId },
      data,
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

// ---------------- PUT ----------------
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const id = Number(params.id);
    if (!id || isNaN(id))
      return NextResponse.json(
        { error: "Invalid volunteer ID" },
        { status: 400 },
      );

    const body = await req.json();
    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        { error: "firstName, lastName, email required" },
        { status: 400 },
      );
    }

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
      joinedYear:
        body.joinedYear?.toString() ?? new Date().getFullYear().toString(),
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
    };

    const updated = await prisma.volunteer.update({ where: { id }, data });
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
    const id = Number(params.id);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid volunteer ID" },
        { status: 400 },
      );
    }

    const volunteer = await prisma.volunteer.findUnique({ where: { id } });
    if (!volunteer) {
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404 },
      );
    }

    await prisma.volunteer.update({
      where: { id },
      data: { status: "INACTIVE" },
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
