import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find the volunteer record for this user
    const volunteer = await prisma.volunteer.findUnique({
      where: { email: sessionUser.email }, // or sessionUser.id if linked
    });

    if (!volunteer) {
      return NextResponse.json(
        { error: "Volunteer record not found" },
        { status: 404 }
      );
    }

    const bookings = await prisma.massBooking.findMany({
      where: { volunteerId: volunteer.id }, // ✅ use volunteer.id
      include: { mass: true, ministry: true },
      orderBy: { mass: { date: "asc" } },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("[GET_MY_SCHEDULE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
