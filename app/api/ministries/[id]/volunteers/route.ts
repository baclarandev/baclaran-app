import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> } // <-- params is a Promise
) {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Await the params before using
  const { id } = await context.params;
  const ministryId = Number(id);

  if (isNaN(ministryId)) {
    return NextResponse.json({ error: "Invalid ministry ID" }, { status: 400 });
  }

  try {
    const volunteers = await prisma.volunteer.findMany({
      where: {
        status: "ACTIVE",
        ministryHistories: {
          some: {
            ministryId,
            status: "ACTIVE",
          },
        },
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
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const transformed = volunteers.map((v) => ({
      id: v.id,
      volunteerCode: v.volunteerCode,
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      phone: v.phone,
      ministryName: v.ministryHistories[0]?.ministry?.name ?? "No Ministry",
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("[GET_MINISTRY_VOLUNTEERS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch ministry volunteers" },
      { status: 500 }
    );
  }
}
