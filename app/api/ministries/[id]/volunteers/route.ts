import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }, // params is a Promise
) {
  // 1️⃣ Check session
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2️⃣ Get ministry ID from params
  const { id } = await context.params;
  const ministryId = Number(id);

  if (isNaN(ministryId)) {
    return NextResponse.json({ error: "Invalid ministry ID" }, { status: 400 });
  }

  try {
    // 3️⃣ Fetch volunteers for this ministry
    const volunteers = await prisma.volunteer.findMany({
      where: {
        status: "ACTIVE",
        ministryHistories: { some: { ministryId, status: "ACTIVE" } },
      },
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

    // 4️⃣ Fetch staff for this ministry (from User table)
    const staffMembers = await prisma.user.findMany({
      where: {
        role: "STAFF",
        ministryId: ministryId,
      },
      orderBy: { createdAt: "desc" },
    });

    // 5️⃣ Transform volunteers
    const transformedVolunteers = volunteers.map((v) => ({
      id: v.id,
      volunteerCode: v.volunteerCode,
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      phone: v.phone,
      ministryName: v.ministryHistories[0]?.ministry?.name ?? "No Ministry",
    }));

    // 6️⃣ Transform staff
    const transformedStaff = staffMembers.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
      ministryId: s.ministryId,
    }));

    // 7️⃣ Return both
    return NextResponse.json({
      staffCount: transformedStaff.length,
      staff: transformedStaff,
      volunteers: transformedVolunteers,
    });
  } catch (error) {
    console.error("[GET_MINISTRY_MEMBERS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch ministry members" },
      { status: 500 },
    );
  }
}
