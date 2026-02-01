import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  context: any, // <-- string, not number
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

    const body = await req.json();

    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        { error: "firstName, lastName, and email are required" },
        { status: 400 },
      );
    }

    const data: any = {
      firstName: body.firstName,
      lastName: body.lastName,
      middleInitial: body.middleInitial ?? null,
      email: body.email,
      phone: body.phone ?? null,
      address: body.address ?? null,
      sex: body.sex,
      profilePicture: body.profilePicture ?? null,
    };

    if (body.dob) data.dateOfBirth = new Date(body.dob);
    if (body.sacraments) data.sacraments = body.sacraments;

    const updated = await prisma.volunteer.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest, context: any) {
  try {
    const id = Number((await context.params).id);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid volunteer ID" },
        { status: 400 },
      );
    }

    const volunteer = await prisma.volunteer.findUnique({
      where: { id },
    });

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
    console.error("ARCHIVE_VOLUNTEER_ERROR", err);
    return NextResponse.json(
      { error: "Failed to archive volunteer" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest, context: any) {
  try {
    const params = await context.params; // ✅ unwrap the Promise
    const id = Number(params.id);

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid volunteer ID" },
        { status: 400 },
      );
    }

    const volunteer = await prisma.volunteer.findUnique({
      where: { id },
      include: {
        ministryHistories: {
          orderBy: { joinedAt: "desc" },
          take: 1,
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

    return NextResponse.json({
      ...volunteer,
      ministryName:
        volunteer.ministryHistories[0]?.ministry?.name || "No Ministry",
    });
  } catch (error) {
    console.error("[GET_VOLUNTEER_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteer" },
      { status: 500 },
    );
  }
}
