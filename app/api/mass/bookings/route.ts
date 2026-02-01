import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET bookings for logged in volunteer (optionally by date)
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dateQuery = req.nextUrl.searchParams.get("date");
    const all = req.nextUrl.searchParams.get("all") === "true";

    // Optional date filter
    let dateFilter: any = {};
    if (dateQuery) {
      const date = new Date(dateQuery);
      // Assuming `mass.date` is a DateTime in your schema
      dateFilter.date = date;
    }

    let bookings;

    // Admin / Chairman: can view all bookings
    if (sessionUser.role === "ADMIN" || sessionUser.role === "CHAIRMAN") {
      bookings = await prisma.massBooking.findMany({
        where: all ? { mass: dateFilter } : {},
        include: {
          mass: true,
          ministry: true,
          volunteer: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }
    // Volunteer: only see own bookings
    else if (sessionUser.role === "VOLUNTEER") {
      bookings = await prisma.massBooking.findMany({
        where: {
          volunteerId: sessionUser.id,
          mass: dateFilter,
        },
        include: {
          mass: true,
          ministry: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      return NextResponse.json({ error: "Invalid role" }, { status: 403 });
    }

    return NextResponse.json(bookings);
  } catch (err) {
    console.error("[GET_BOOKINGS_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}

// POST book a slot (locks it)
export async function POST(req: NextRequest) {
  try {
    // Get logged-in user (VOLUNTEER or ADMIN)
    const sessionUser = await getSession();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only volunteers can book a slot
    if (sessionUser.role !== "VOLUNTEER") {
      return NextResponse.json(
        { error: "Only volunteers can create bookings" },
        { status: 403 },
      );
    }

    const volunteerId = sessionUser.id; // Safe, always assigned

    // Get request body
    const body = await req.json();
    const { massId, ministryId } = body;

    if (!massId || !ministryId) {
      return NextResponse.json(
        { error: "Missing massId or ministryId" },
        { status: 400 },
      );
    }

    // Optional: check if volunteer already booked this mass and ministry
    const existingBooking = await prisma.massBooking.findFirst({
      where: { massId, ministryId, volunteerId },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "You have already booked this slot" },
        { status: 400 },
      );
    }

    // Create the booking
    const booking = await prisma.massBooking.create({
      data: {
        massId,
        volunteerId,
        ministryId,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      { message: "Booking created successfully", booking },
      { status: 201 },
    );
  } catch (err) {
    console.error("[MASS_BOOKING_CREATE_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
