import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { AttendanceStatus, attendance_response } from "@prisma/client";

/* =========================================================
   GET EVENT + ATTENDANCE
========================================================= */
export async function GET(
  _req: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await Promise.resolve(context.params);
    const eventId = Number(id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "Invalid event id" },
        { status: 400 },
      );
    }

    /* =========================
       1️⃣ FETCH EVENT + VOLUNTEERS
    ========================= */
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        volunteers: {
          include: {
            volunteer: {
              include: {
                ministryHistories: {
                  where: { status: "ACTIVE" },
                  include: { ministry: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    /* =========================
       2️⃣ FILTER VOLUNTEERS (ROLE BASED)
    ========================= */
    let allowedMinistryIds: number[] = [];

    if (sessionUser.role === "ADMIN" && sessionUser.ministryId) {
      allowedMinistryIds = [sessionUser.ministryId];
    }

    if (sessionUser.role === "STAFF" && sessionUser.ministryId) {
      const subMinistries = await prisma.ministry.findMany({
        where: { parentId: sessionUser.ministryId },
        select: { id: true },
      });

      allowedMinistryIds = [
        sessionUser.ministryId,
        ...subMinistries.map((m) => m.id),
      ];
    }

    const filteredVolunteers =
      sessionUser.role === "ADMIN" || sessionUser.role === "STAFF"
        ? event.volunteers.filter((ev) => {
            const ministryId = ev.volunteer.ministryHistories[0]?.ministryId;

            if (allowedMinistryIds.length === 0) return true;
            return allowedMinistryIds.includes(ministryId);
          })
        : [];

    /* =========================
       3️⃣ ENSURE 1 RECORD PER VOLUNTEER
    ========================= */
    await prisma.$transaction(
      filteredVolunteers.map((ev) =>
        prisma.eventAttendance.upsert({
          where: {
            eventId_volunteerId: {
              eventId,
              volunteerId: ev.volunteerId,
            },
          },
          create: {
            eventId,
            volunteerId: ev.volunteerId,
            status: "PENDING",
            response: "NO_RESPONSE",
            session: null, // 👈 important
          },
          update: {}, // do nothing if exists
        }),
      ),
    );

    /* =========================
       4️⃣ FETCH ATTENDANCE
    ========================= */
    const attendance = await prisma.eventAttendance.findMany({
      where: {
        eventId,
        volunteerId: {
          in: filteredVolunteers.map((v) => v.volunteerId),
        },
      },
      include: {
        volunteer: {
          include: {
            ministryHistories: {
              where: { status: "ACTIVE" },
              include: { ministry: true },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        volunteer: { lastName: "asc" },
      },
    });

    /* =========================
       5️⃣ FORMAT RESPONSE
    ========================= */
    const formatted = attendance.map((a) => ({
      id: a.id,
      volunteer: {
        id: a.volunteer.id,
        firstName: a.volunteer.firstName,
        lastName: a.volunteer.lastName,
        ministry: a.volunteer.ministryHistories[0]?.ministry || null,
      },
      status: a.status,
      response: a.response,
      session: a.session, // null initially
    }));

    return NextResponse.json({
      id: event.id,
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      status: event.status,
      volunteers: formatted,
    });
  } catch (error) {
    console.error("GET event error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

/* =========================================================
   PATCH UPDATE ATTENDANCE
========================================================= */
const AttendanceUpdateSchema = z.object({
  attendanceId: z.number(),
  session: z.enum(["AM", "PM"]).optional(),
  status: z.nativeEnum(AttendanceStatus).optional(),
  response: z.nativeEnum(attendance_response).optional(),
});

export async function PATCH(req: Request) {
  try {
    const sessionUser = await getSession();

    if (!sessionUser || !["ADMIN", "STAFF"].includes(sessionUser.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const data = AttendanceUpdateSchema.parse(body);

    const existing = await prisma.eventAttendance.findUnique({
      where: { id: data.attendanceId },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Attendance not found" },
        { status: 404 },
      );
    }

    /* =========================
       🎯 AUTO STATUS LOGIC
    ========================= */
    let finalStatus = data.status ?? existing.status;
    let finalResponse = data.response ?? existing.response;

    if (data.response) {
      finalStatus = data.response === "CAN_ATTEND" ? "CONFIRMED" : "PENDING";
    }

    /* =========================
       ✅ UPDATE SINGLE RECORD
    ========================= */
    const updated = await prisma.eventAttendance.update({
      where: { id: data.attendanceId },
      data: {
        session: data.session ?? existing.session,
        status: finalStatus,
        response: finalResponse,
      },
      include: {
        volunteer: {
          include: {
            ministryHistories: {
              where: { status: "ACTIVE" },
              include: { ministry: true },
              take: 1,
            },
          },
        },
      },
    });

    return NextResponse.json({
      id: updated.id,
      volunteer: {
        id: updated.volunteer.id,
        firstName: updated.volunteer.firstName,
        lastName: updated.volunteer.lastName,
        ministry: updated.volunteer.ministryHistories[0]?.ministry || null,
      },
      status: updated.status,
      response: updated.response,
      session: updated.session,
    });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}

/* =========================================================
   DELETE EVENT
========================================================= */
export async function DELETE(
  _req: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const sessionUser = await getSession();

    if (!sessionUser || sessionUser.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await Promise.resolve(context.params);
    const eventId = Number(id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "Invalid event id" },
        { status: 400 },
      );
    }

    await prisma.eventAttendance.deleteMany({
      where: { eventId },
    });

    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { message: "Failed to delete event" },
      { status: 500 },
    );
  }
}
