import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateVolunteerCode } from "@/app/lib/generate-volunteer-code";
import { getRootMinistryId } from "@/lib/get-root-ministry";

const currentYear = new Date().getFullYear();

// ---------------- GET ----------------
export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const volunteerId = Number(id);

    if (!volunteerId || isNaN(volunteerId))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
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
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      ...volunteer,
      ministryName:
        volunteer.ministryHistories[0]?.ministry?.name ?? "No Ministry",
    });
  } catch (err) {
    console.error("[GET]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// ---------------- PATCH ----------------
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const sessionUser = await getSession();
  if (!sessionUser)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await context.params;
    const volunteerId = Number(id);

    if (!volunteerId || isNaN(volunteerId))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
      include: {
        ministryHistories: { where: { status: "ACTIVE" } },
      },
    });

    if (!volunteer)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const volunteerMinistryId = volunteer.ministryHistories[0]?.ministryId;

    const isAllowed =
      sessionUser.role === "ADMIN" ||
      (sessionUser.role === "STAFF" &&
        sessionUser.ministryId === volunteerMinistryId);

    if (!isAllowed)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const data: any = {};

    // ================= BASIC =================
    const fields = [
      "firstName",
      "lastName",
      "middleInitial",
      "nickname",
      "email",
      "phone",
      "address",
      "sex",
      "civilStatus",
      "occupation",
      "status",
      "sacraments",
    ];

    fields.forEach((f) => {
      if (body[f] !== undefined) data[f] = body[f];
    });

    if (body.dateOfBirth !== undefined) {
      data.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    }

    if (body.joinedYearShrine !== undefined)
      data.joinedYearShrine = body.joinedYearShrine;

    if (body.joinedYearMinistry !== undefined)
      data.joinedYearMinistry = body.joinedYearMinistry;

    if (body.classification !== undefined)
      data.classification = body.classification;

    // ================= IMAGE (NO DELETE) =================
    if (body.profilePicture !== undefined) {
      if (!body.profilePicture) {
        data.profilePicture = null;
      }
      if (body.profilePicture !== undefined) {
        data.profilePicture = body.profilePicture || null;
      }
    }

    // ================= TIMELINES (SAFE CLEAN) =================
    if (Array.isArray(body.timelines)) {
      data.timelines = {
        deleteMany: {},
        createMany: {
          data: body.timelines.map((t: any) => ({
            organization: t.organization,
            startYear: t.startYear,
            endYear: t.endYear,
            type: t.type,
            parish: t.parish ?? "",
            totalYears: (t.endYear ?? currentYear) - t.startYear + 1,
          })),
        },
      };
    }

    const updated = await prisma.volunteer.update({
      where: { id: volunteerId },
      data,
      include: { timelines: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH]", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// ---------------- PUT ----------------
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const volunteerId = Number(id);

    if (!volunteerId || isNaN(volunteerId))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();

    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
      include: { ministryHistories: true },
    });

    const data: any = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      profilePicture: body.profilePicture ?? null,
      profilePicturePublicId: body.profilePicturePublicId ?? null,
      joinedYearShrine: body.joinedYearShrine ?? currentYear,
      joinedYearMinistry: body.joinedYearMinistry ?? currentYear,
    };

    // TIMELINES SAFE CLEAN
    if (Array.isArray(body.timelines)) {
      data.timelines = {
        deleteMany: {},
        createMany: {
          data: body.timelines.map((t: any) => ({
            organization: t.organization,
            startYear: t.startYear,
            endYear: t.endYear,
            type: t.type,
            parish: t.parish ?? "",
            totalYears: (t.endYear ?? currentYear) - t.startYear + 1,
          })),
        },
      };
    }

    // regenerate code
    if (volunteer?.ministryHistories?.length) {
      const rootId = await getRootMinistryId(
        volunteer.ministryHistories[0].ministryId,
      );

      const { volunteerCode } = await generateVolunteerCode(
        rootId,
        body.joinedYearShrine ?? currentYear,
      );

      data.volunteerCode = volunteerCode;
    }

    const updated = await prisma.volunteer.update({
      where: { id: volunteerId },
      data,
      include: { timelines: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT]", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// ---------------- DELETE ----------------
export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const volunteerId = Number(id);

    if (!volunteerId || isNaN(volunteerId))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const volunteer = await prisma.volunteer.findUnique({
      where: { id: volunteerId },
    });

    if (!volunteer)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // ❌ NO CLOUDINARY DELETE
    await prisma.volunteer.delete({
      where: { id: volunteerId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE]", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
