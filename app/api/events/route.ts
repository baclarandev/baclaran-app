import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
      // include: {
      //   volunteers: { include: { volunteer: true } },
      //   attendance: { include: { volunteer: true } },
      // },
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

// POST /api/events (Admin & Staff)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      ministryId,
    } = body;

    if (!title || !startDate || !endDate || !startTime || !endTime) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1️⃣ Determine which volunteers to link
    let volunteerIds: number[] = [];

    if (session.role === "ADMIN") {
      // Admin sees all volunteers
      const allVolunteers = await prisma.volunteer.findMany({
        select: { id: true },
      });
      volunteerIds = allVolunteers.map((v) => v.id);
    } else if (session.role === "STAFF") {
      // Staff sees volunteers in their ministry + sub-ministries
      const ministryToUse = ministryId ?? session.ministryId;
      const subMinistries = await prisma.ministry.findMany({
        where: { parentId: ministryToUse },
        select: { id: true },
      });
      const ministryIds = [ministryToUse, ...subMinistries.map((m) => m.id)];

      const volunteersInMinistries = await prisma.volunteer.findMany({
        where: {
          ministryHistories: {
            some: { ministryId: { in: ministryIds }, status: "ACTIVE" },
          },
        },
        select: { id: true },
      });

      volunteerIds = volunteersInMinistries.map((v) => v.id);
    }

    // 2️⃣ Create Event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime,
        endTime,
        ministryId: ministryId ?? null,
      },
    });

    // 3️⃣ Link volunteers automatically
    if (volunteerIds.length > 0) {
      // EventVolunteer link
      await prisma.eventVolunteer.createMany({
        data: volunteerIds.map((volId) => ({
          eventId: event.id,
          volunteerId: volId,
        })),
        skipDuplicates: true,
      });

      // Create attendance records for all volunteers
      await prisma.eventAttendance.createMany({
        data: volunteerIds.map((volId) => ({
          eventId: event.id,
          volunteerId: volId,
          status: "PENDING",
          session: "AM",
          response: "NO_RESPONSE",
        })),
        skipDuplicates: true,
      });
    }

    // 4️⃣ Return event with linked volunteers and attendance
    const eventWithVolunteers = await prisma.event.findUnique({
      where: { id: event.id },
      include: {
        volunteers: { include: { volunteer: true } },
        attendance: { include: { volunteer: true } },
      },
    });

    return NextResponse.json(eventWithVolunteers, { status: 201 });
  } catch (error) {
    console.error("[EVENT_CREATE_ERROR]", error);
    return NextResponse.json(
      { message: "Failed to create event" },
      { status: 500 },
    );
  }
}
