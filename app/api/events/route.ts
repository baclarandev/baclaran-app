import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Helper to compute status
function computeStatus(start: Date, end: Date) {
  const now = new Date();

  if (now < start) return "UPCOMING";
  if (now >= start && now <= end) return "ONGOING";
  return "COMPLETED";
}

// GET /api/events
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const skip = parseInt(url.searchParams.get("skip") || "0");
    const take = parseInt(url.searchParams.get("take") || "10");

    const events = await prisma.event.findMany({
      skip,
      take,
      orderBy: { startDate: "desc" },
      include: {
        volunteers: { include: { volunteer: true } },
        attendance: { include: { volunteer: true } },
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

// POST /api/events (Admin only)
export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      sex,
      civilStatus,
      volunteerCode,
      ministryId,
    } = body;

    if (!firstName || !lastName || !email || !volunteerCode) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    /* =========================
       1️⃣ CREATE VOLUNTEER
    ========================= */

    const volunteer = await prisma.volunteer.create({
      data: {
        firstName,
        lastName,
        email,
        sex,
        civilStatus,
        volunteerCode,
        ministryId: ministryId ?? null,
      },
    });

    /* =========================
       2️⃣ FIND FUTURE EVENTS
    ========================= */

    const futureEvents = await prisma.event.findMany({
      where: {
        endDate: {
          gte: new Date(),
        },
        archived: false,
      },
      select: {
        id: true,
      },
    });

    /* =========================
       3️⃣ AUTO ADD TO ATTENDANCE
    ========================= */

    if (futureEvents.length > 0) {
      await prisma.eventAttendance.createMany({
        data: futureEvents.map((event) => ({
          eventId: event.id,
          volunteerId: volunteer.id,
          session: "AM",
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json(volunteer, { status: 201 });
  } catch (error) {
    console.error("[VOLUNTEER_CREATE_ERROR]", error);

    return NextResponse.json(
      { message: "Failed to create volunteer" },
      { status: 500 },
    );
  }
}
