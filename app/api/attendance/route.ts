import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { meeting_attendance, Prisma } from "@prisma/client";

/* =========================================================
   GET ATTENDANCE
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

    // =========================================
    // MINISTRY FILTER
    // =========================================

    let whereClause: Prisma.VolunteerWhereInput;

    if (sessionUser.role === "ADMIN") {
      // ADMIN can see everything or filter by a selected ministry.
      const selectedMinistry = searchParams.get("ministryId");

      if (selectedMinistry && selectedMinistry !== "all") {
        const selectedMinistryId = Number(selectedMinistry);

        if (!Number.isInteger(selectedMinistryId) || selectedMinistryId <= 0) {
          return NextResponse.json(
            { error: "Invalid ministry ID" },
            { status: 400 },
          );
        }

        whereClause = {
          ministryHistories: {
            some: {
              ministryId: selectedMinistryId,
              status: "ACTIVE",
            },
          },
        };
      } else {
        whereClause = {};
      }
    } else if (sessionUser.role === "STAFF" && sessionUser.ministryId) {
      // STAFF can only access their assigned ministry
      // and its direct child ministries.

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
      // No access to volunteer records.
      whereClause = {
        id: -1,
      };
    }

    // =========================================
    // TOTAL COUNT
    // =========================================

    const total = await prisma.volunteer.count({
      where: whereClause,
    });

    // =========================================
    // VOLUNTEERS + DAILY ATTENDANCE
    // =========================================

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

    // =========================================
    // MONTHLY MEETING SUMMARIES
    // =========================================

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

    // =========================================
    // DAYS IN SELECTED MONTH
    // =========================================

    const daysInMonth = new Date(year, month, 0).getDate();

    // =========================================
    // FORMAT RESPONSE
    // =========================================

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
            id: service.id,
            serviceOrder: service.serviceOrder ?? 1,
            timeIn: service.timeIn,
            presentCount: service.presentCount ?? 0,
          })),
        };
      });

      return {
        id: volunteer.id,
        firstName: volunteer.firstName,
        lastName: volunteer.lastName,

        // Use the volunteer's actual active ministry.
        ministryId: volunteer.ministryHistories[0]?.ministryId ?? null,

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

/* =========================================================
   POST ATTENDANCE
   Monthly meeting, Time In, Time Out, Clear Time In/Out
========================================================= */

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSession();

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
      value,
    } = body;

    // ─────────────────────────────────────
    // 1. MONTHLY MEETING
    // ─────────────────────────────────────

    if (type === "MONTHLY") {
      if (
        !Number.isInteger(volunteerId) ||
        !Number.isInteger(month) ||
        !Number.isInteger(year) ||
        month < 1 ||
        month > 12 ||
        !["PRESENT", "ABSENT", "EXCUSED"].includes(value)
      ) {
        return NextResponse.json(
          { error: "Invalid monthly attendance data" },
          { status: 400 },
        );
      }

      const updated = await prisma.volunteerAttendanceSummary.upsert({
        where: {
          volunteer_summary_unique: {
            volunteerId,
            month,
            year,
          },
        },
        update: {
          monthlyMeeting: value as meeting_attendance,
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

    // ─────────────────────────────────────
    // 2. VALIDATE DAILY ATTENDANCE
    // ─────────────────────────────────────

    if (
      !Number.isInteger(volunteerId) ||
      !Number.isInteger(ministryId) ||
      !Number.isInteger(day) ||
      !Number.isInteger(month) ||
      !Number.isInteger(year) ||
      day < 1 ||
      day > new Date(year, month, 0).getDate() ||
      month < 1 ||
      month > 12
    ) {
      return NextResponse.json(
        { error: "Invalid daily attendance data" },
        { status: 400 },
      );
    }

    // ─────────────────────────────────────
    // 3. FIND ACTIVE SESSION
    // ─────────────────────────────────────

    const active = await prisma.volunteerAttendance.findFirst({
      where: {
        volunteerId,
        day,
        month,
        year,
        type: "DAILY",
        timeOut: null,
      },
      orderBy: {
        serviceOrder: "desc",
      },
    });

    // ─────────────────────────────────────
    // 4. TIME OUT
    // ─────────────────────────────────────

    if (timeOut) {
      if (!active) {
        return NextResponse.json(
          { error: "No active session found." },
          { status: 400 },
        );
      }

      const parsedTimeOut = new Date(timeOut);

      if (Number.isNaN(parsedTimeOut.getTime())) {
        return NextResponse.json(
          { error: "Invalid time out value." },
          { status: 400 },
        );
      }

      const updated = await prisma.volunteerAttendance.update({
        where: {
          id: active.id,
        },
        data: {
          timeOut: parsedTimeOut,
        },
      });

      return NextResponse.json({
        success: true,
        action: "CLOSE",
        attendance: updated,
      });
    }

    // ─────────────────────────────────────
    // 5. CLEAR TIME IN
    // ─────────────────────────────────────

    if (body.clearTimeIn && active) {
      await prisma.volunteerAttendance.delete({
        where: {
          id: active.id,
        },
      });

      return NextResponse.json({
        success: true,
        action: "CLEAR_TIME_IN",
      });
    }

    // ─────────────────────────────────────
    // 6. CLEAR TIME OUT
    // ─────────────────────────────────────

    if (body.clearTimeOut) {
      const completedSession = await prisma.volunteerAttendance.findFirst({
        where: {
          volunteerId,
          day,
          month,
          year,
          type: "DAILY",
          timeOut: {
            not: null,
          },
        },
        orderBy: {
          serviceOrder: "desc",
        },
      });

      if (!completedSession) {
        return NextResponse.json(
          { error: "No completed session found." },
          { status: 400 },
        );
      }

      const updated = await prisma.volunteerAttendance.update({
        where: {
          id: completedSession.id,
        },
        data: {
          timeOut: null,
        },
      });

      return NextResponse.json({
        success: true,
        action: "CLEAR_TIME_OUT",
        attendance: updated,
      });
    }

    // ─────────────────────────────────────
    // 7. CREATE NEW SESSION
    // ─────────────────────────────────────

    if (!timeIn) {
      return NextResponse.json(
        { error: "Time in is required." },
        { status: 400 },
      );
    }

    const parsedTimeIn = new Date(timeIn);

    if (Number.isNaN(parsedTimeIn.getTime())) {
      return NextResponse.json(
        { error: "Invalid time in value." },
        { status: 400 },
      );
    }

    const last = await prisma.volunteerAttendance.findFirst({
      where: {
        volunteerId,
        day,
        month,
        year,
        type: "DAILY",
      },
      orderBy: {
        serviceOrder: "desc",
      },
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
        timeIn: parsedTimeIn,
        timeOut: null,
      },
    });

    return NextResponse.json({
      success: true,
      action: "NEW_SERVICE",
      attendance: created,
    });
  } catch (error) {
    console.error("[POST_ATTENDANCE_ERROR]", error);

    return NextResponse.json(
      { error: "Failed to save attendance" },
      { status: 500 },
    );
  }
}

/* =========================================================
   DELETE ATTENDANCE SESSION
   Deletes one session and reorders remaining sessions.
========================================================= */

export async function DELETE(req: NextRequest) {
  try {
    const sessionUser = await getSession();

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const attendanceId = Number(body.id);

    if (!Number.isInteger(attendanceId) || attendanceId <= 0) {
      return NextResponse.json(
        { error: "Invalid attendance ID." },
        { status: 400 },
      );
    }

    // Find the exact attendance record.
    const attendance = await prisma.volunteerAttendance.findFirst({
      where: {
        id: attendanceId,
        type: "DAILY",
      },
    });

    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance session not found." },
        { status: 404 },
      );
    }

    // ─────────────────────────────────────
    // 1. CHECK MINISTRY PERMISSIONS
    // ─────────────────────────────────────

    if (sessionUser.role !== "ADMIN") {
      if (!sessionUser.ministryId) {
        return NextResponse.json(
          { error: "No assigned ministry." },
          { status: 403 },
        );
      }

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

      // Check the attendance ministry.
      if (!allowedMinistryIds.includes(attendance.ministryId)) {
        return NextResponse.json(
          { error: "You cannot delete this attendance session." },
          { status: 403 },
        );
      }

      // Check that the volunteer belongs to the allowed ministry hierarchy.
      const volunteer = await prisma.volunteer.findFirst({
        where: {
          id: attendance.volunteerId,
          ministryHistories: {
            some: {
              ministryId: {
                in: allowedMinistryIds,
              },
              status: "ACTIVE",
            },
          },
        },
        select: {
          id: true,
        },
      });

      if (!volunteer) {
        return NextResponse.json(
          { error: "You cannot delete this attendance session." },
          { status: 403 },
        );
      }
    }

    // ─────────────────────────────────────
    // 2. DELETE + REORDER IN TRANSACTION
    // ─────────────────────────────────────

    await prisma.$transaction(async (tx) => {
      // Delete selected session.
      await tx.volunteerAttendance.delete({
        where: {
          id: attendanceId,
        },
      });

      // Get remaining sessions for the same volunteer and date.
      const remainingSessions = await tx.volunteerAttendance.findMany({
        where: {
          volunteerId: attendance.volunteerId,
          day: attendance.day,
          month: attendance.month,
          year: attendance.year,
          type: "DAILY",
        },
        orderBy: [
          {
            serviceOrder: "asc",
          },
          {
            id: "asc",
          },
        ],
        select: {
          id: true,
        },
      });

      // Assign temporary negative values to avoid
      // serviceOrder conflicts during reordering.
      for (let index = 0; index < remainingSessions.length; index++) {
        await tx.volunteerAttendance.update({
          where: {
            id: remainingSessions[index].id,
          },
          data: {
            serviceOrder: -(index + 1),
          },
        });
      }

      // Restore sequential numbering: 1, 2, 3...
      for (let index = 0; index < remainingSessions.length; index++) {
        await tx.volunteerAttendance.update({
          where: {
            id: remainingSessions[index].id,
          },
          data: {
            serviceOrder: index + 1,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      action: "DELETE_SESSION",
      deletedId: attendanceId,
      message: "Attendance session deleted successfully.",
    });
  } catch (error) {
    console.error("[DELETE_ATTENDANCE_ERROR]", error);

    return NextResponse.json(
      { error: "Failed to delete attendance session." },
      { status: 500 },
    );
  }
}
