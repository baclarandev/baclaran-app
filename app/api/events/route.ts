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
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    console.log("🧾 RAW BODY:", body);

    const { title, description, startDate, endDate, startTime, endTime } = body;

    if (!title || !startDate || !endDate || !startTime || !endTime) {
      return NextResponse.json(
        {
          message:
            "title, startDate, endDate, startTime, and endTime are required",
        },
        { status: 400 },
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const status = computeStatus(start, end);

    const newEvent = await prisma.event.create({
      data: {
        title,
        description: description ?? null,
        startDate: start,
        endDate: end,
        startTime,
        endTime,
        status, // 🔥 DB-driven status
        archived: false,
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("[EVENT_CREATE_ERROR]", error);
    return NextResponse.json(
      { message: "Failed to create event" },
      { status: 500 },
    );
  }
}
