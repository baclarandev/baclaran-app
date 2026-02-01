import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admin/chairman
  if (!["ADMIN", "CHAIRMAN"].includes(sessionUser.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const dateQuery = req.nextUrl.searchParams.get("date");
  let massFilter: any = {};
  if (dateQuery) {
    const start = new Date(dateQuery);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateQuery);
    end.setHours(23, 59, 59, 999);
    massFilter = { date: { gte: start, lte: end } };
  }

  try {
    const bookings = await prisma.massBooking.findMany({
      where: { mass: massFilter },
      include: { mass: true, volunteer: true, ministry: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (err) {
    console.error("[FETCH_ALL_BOOKINGS_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
