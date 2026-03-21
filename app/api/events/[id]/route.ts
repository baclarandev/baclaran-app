import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { AttendanceStatus, attendance_response } from "@prisma/client";
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

    // 1️⃣ Fetch event + volunteers
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        volunteers: {
          include: { volunteer: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // 2️⃣ STAFF filtering
    let allowedVolunteerIds: number[] | undefined;

    if (sessionUser.role === "STAFF" && sessionUser.ministryId) {
      const subMinistries = await prisma.ministry.findMany({
        where: { parentId: sessionUser.ministryId },
        select: { id: true },
      });

      const ministryIds = [
        sessionUser.ministryId,
        ...subMinistries.map((m) => m.id),
      ];

      const volunteers = await prisma.volunteer.findMany({
        where: {
          ministryHistories: {
            some: {
              ministryId: { in: ministryIds },
              status: "ACTIVE",
            },
          },
        },
        select: { id: true },
      });

      allowedVolunteerIds = volunteers.map((v) => v.id);
    }

    const filteredVolunteers = event.volunteers.filter(
      (ev) =>
        !allowedVolunteerIds || allowedVolunteerIds.includes(ev.volunteerId),
    );

    // 3️⃣ AUTO-CREATE attendance (only AM)
    await prisma.$transaction(
      filteredVolunteers.map((ev) =>
        prisma.eventAttendance.upsert({
          where: {
            eventId_volunteerId_session: {
              eventId,
              volunteerId: ev.volunteerId,
              session: "AM", // single session only
            },
          },
          update: {},
          create: {
            eventId,
            volunteerId: ev.volunteerId,
            session: "AM",
            status: "PENDING",
            response: "NO_RESPONSE",
          },
        }),
      ),
    );

    // 4️⃣ Fetch attendance (AM only)
    const attendance = await prisma.eventAttendance.findMany({
      where: {
        eventId,
        session: "AM",
        ...(allowedVolunteerIds && {
          volunteerId: { in: allowedVolunteerIds },
        }),
      },
      include: {
        volunteer: true,
      },
      orderBy: [{ volunteer: { lastName: "asc" } }],
    });

    // 5️⃣ Format response
    const formatted = attendance.map((a) => ({
      id: a.id,
      volunteer: {
        id: a.volunteer.id,
        firstName: a.volunteer.firstName,
        lastName: a.volunteer.lastName,
        ministry: a.volunteer.ministryId,
      },
      status: a.status,
      response: a.response,
      session: a.session,
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
const AttendanceUpdateSchema = z.object({
  attendanceId: z.number(),
  session: z.enum(["AM", "PM"]).optional(),
  status: z.nativeEnum(AttendanceStatus).optional(),
  response: z.nativeEnum(attendance_response).optional(),
});

export async function PATCH(
  req: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
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
        { message: "Attendance record not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.eventAttendance.update({
      where: { id: data.attendanceId },
      data: {
        session: data.session ?? existing.session,
        status: data.status ?? existing.status,
        response: data.response ?? existing.response,
      },
      include: {
        volunteer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH attendance error:", error);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}
