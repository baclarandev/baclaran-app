import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { meeting_attendance, Prisma } from "@prisma/client";
/* =========================================================
   GET ATTENDANCE (TABLE DATA)
========================================================= */

/* =========================================================
   GET ATTENDANCE (TABLE DATA)
   Supports parent ministry + direct sub-ministries
========================================================= */
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSession();

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;

    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));

    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 10),
    );

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12 ||
      !Number.isInteger(year) ||
      year < 1900
    ) {
      return NextResponse.json(
        { error: "Invalid month or year" },
        { status: 400 },
      );
    }

    const skip = (page - 1) * limit;

    // ─── MINISTRY FILTER ─────────────────────
    let whereClause: Prisma.VolunteerWhereInput;

    if (sessionUser.role === "ADMIN") {
      whereClause = {};
    } else if (sessionUser.ministryId) {
      // Include the staff member's ministry and its children.
      const childMinistries = await prisma.ministry.findMany({
        where: {
          parentId: sessionUser.ministryId,
        },
        select: {
          id: true,
        },
      });

      const allowedMinistryIds = [
        sessionUser.ministryId,
        ...childMinistries.map((ministry) => ministry.id),
      ];

      whereClause = {
        ministryHistories: {
          some: {
            ministryId: {
              in: allowedMinistryIds,
            },
            status: "ACTIVE",
          },
        },
      };
    } else {
      // No assigned ministry: return no volunteers.
      whereClause = {
        id: -1,
      };
    }

    console.log("[ATTENDANCE]", {
      role: sessionUser.role,
      ministryId: sessionUser.ministryId,
      page,
      limit,
    });

    // ─── TOTAL COUNT ─────────────────────────
    const total = await prisma.volunteer.count({
      where: whereClause,
    });

    // ─── VOLUNTEERS + DAILY ATTENDANCE ───────
    const volunteers = await prisma.volunteer.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: {
        attendances: {
          where: {
            month,
            year,
            type: "DAILY",
          },
          orderBy: {
            serviceOrder: "asc",
          },
        },
        ministryHistories: {
          where: {
            status: "ACTIVE",
          },
          select: {
            ministryId: true,
            status: true,
          },
        },
      },
    });

    // ─── MONTHLY MEETING SUMMARIES ───────────
    const summaries = await prisma.volunteerAttendanceSummary.findMany({
      where: {
        month,
        year,
        volunteerId: {
          in: volunteers.map((volunteer) => volunteer.id),
        },
      },
      select: {
        volunteerId: true,
        monthlyMeeting: true,
      },
    });

    const summaryMap = new Map(
      summaries.map((summary) => [summary.volunteerId, summary.monthlyMeeting]),
    );

    // ─── DAYS IN SELECTED MONTH ──────────────
    const daysInMonth = new Date(year, month, 0).getDate();

    // ─── FORMAT RESPONSE ────────────────────
    const data = volunteers.map((volunteer) => {
      const grouped = new Map<number, typeof volunteer.attendances>();

      for (const attendance of volunteer.attendances) {
        if (attendance.day == null) continue;

        const existing = grouped.get(attendance.day) ?? [];
        existing.push(attendance);
        grouped.set(attendance.day, existing);
      }

      const days = Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        const services = grouped.get(day) ?? [];

        return {
          day,
          services: services.map((service) => ({
            serviceOrder: service.serviceOrder ?? 1,
            timeIn: service.timeIn,
            timeOut: service.timeOut,
            presentCount: service.presentCount ?? 0,
          })),
        };
      });

      return {
        id: volunteer.id,
        firstName: volunteer.firstName,
        lastName: volunteer.lastName,

        // For staff, use their assigned parent ministry ID.
        // For admins, use the volunteer's active ministry.
        ministryId:
          sessionUser.role === "ADMIN"
            ? (volunteer.ministryHistories[0]?.ministryId ?? null)
            : sessionUser.ministryId,

        monthlyMeeting: summaryMap.get(volunteer.id) ?? "ABSENT",

        days,
      };
    });

    return NextResponse.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET_ATTENDANCE_ERROR]", error);

    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    type,
    volunteerId,
    ministryId,
    day,
    month,
    year,
    timeIn,
    timeOut,
    value, // monthlyMeeting value
  } = body;

  /* =========================================================
     1. MONTHLY MEETING UPDATE
  ========================================================= */
  if (type === "MONTHLY") {
    const updated = await prisma.volunteerAttendanceSummary.upsert({
      where: {
        volunteer_summary_unique: {
          volunteerId,
          month,
          year,
        },
      },
      update: {
        monthlyMeeting: value as meeting_attendance, // PRESENT | ABSENT | EXCUSED
      },
      create: {
        volunteerId,
        month,
        year,
        monthlyMeeting: value as meeting_attendance,
        monthlyServed: 0,
        totalServe: 0,
      },
    });

    return NextResponse.json({
      success: true,
      action: "MONTHLY_UPDATE",
      data: updated,
    });
  }

  /* =========================================================
     2. FULL SESSION (TIME IN + TIME OUT)
  ========================================================= */
  if (timeIn && timeOut) {
    const last = await prisma.volunteerAttendance.findFirst({
      where: { volunteerId, day, month, year, type: "DAILY" },
      orderBy: { serviceOrder: "desc" },
    });

    const nextOrder = (last?.serviceOrder ?? 0) + 1;

    const created = await prisma.volunteerAttendance.create({
      data: {
        volunteerId,
        ministryId,
        type: "DAILY",
        day,
        month,
        year,
        present: true,
        presentCount: 1,
        serviceOrder: nextOrder,
        timeIn: new Date(timeIn),
        timeOut: new Date(timeOut),
      },
    });

    return NextResponse.json({
      success: true,
      action: "FULL_SESSION",
      attendance: created,
    });
  }

  /* =========================================================
     3. FIND ACTIVE SESSION
  ========================================================= */
  const active = await prisma.volunteerAttendance.findFirst({
    where: {
      volunteerId,
      day,
      month,
      year,
      type: "DAILY",
      timeOut: null,
    },
    orderBy: { serviceOrder: "desc" },
  });

  /* =========================================================
     4. CLOSE ONLY
  ========================================================= */
  if (timeOut && active) {
    const updated = await prisma.volunteerAttendance.update({
      where: { id: active.id },
      data: {
        timeOut: new Date(timeOut),
      },
    });

    return NextResponse.json({
      success: true,
      action: "CLOSE",
      attendance: updated,
    });
  }

  /* =========================================================
     5. AUTO CLOSE OLD SESSION
  ========================================================= */
  if (active) {
    await prisma.volunteerAttendance.update({
      where: { id: active.id },
      data: {
        timeOut: new Date(),
      },
    });
  }

  /* =========================================================
     6. CREATE NEW SESSION
  ========================================================= */
  const last = await prisma.volunteerAttendance.findFirst({
    where: { volunteerId, day, month, year, type: "DAILY" },
    orderBy: { serviceOrder: "desc" },
  });

  const nextOrder = (last?.serviceOrder ?? 0) + 1;

  const created = await prisma.volunteerAttendance.create({
    data: {
      volunteerId,
      ministryId,
      type: "DAILY",
      day,
      month,
      year,
      present: true,
      presentCount: 1,
      serviceOrder: nextOrder,
      timeIn: timeIn ? new Date(timeIn) : new Date(),
      timeOut: null,
    },
  });

  if (!["PRESENT", "ABSENT", "EXCUSED"].includes(value)) {
    return NextResponse.json({ error: "Invalid value" }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    action: "NEW_SERVICE",
    attendance: created,
  });
}
