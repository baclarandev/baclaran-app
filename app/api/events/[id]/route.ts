import { z } from "zod";
import { AttendanceStatus, attendance_response } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

// Schema for PATCH
const AttendanceUpdateSchema = z.object({
  attendanceId: z.number(),
  session: z.enum(["AM", "PM"]).optional(),
  status: z.nativeEnum(AttendanceStatus).optional(),
  response: z.nativeEnum(attendance_response).optional(),
});

// GET event + attendance
export async function GET(
  _req: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await Promise.resolve(context.params);
    const eventId = Number(id);
    if (isNaN(eventId))
      return NextResponse.json(
        { message: "Invalid event id" },
        { status: 400 },
      );

    // 1️⃣ Fetch event with linked volunteers and attendance records
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        volunteers: { include: { volunteer: true } }, // EventVolunteer table
        attendance: { include: { volunteer: true } }, // EventAttendance table
      },
    });

    if (!event)
      return NextResponse.json({ message: "Event not found" }, { status: 404 });

    // 2️⃣ Determine allowed volunteers if staff
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

      const volunteersInMinistries = await prisma.volunteer.findMany({
        where: {
          ministryHistories: {
            some: { ministryId: { in: ministryIds }, status: "ACTIVE" },
          },
        },
        select: { id: true },
      });

      allowedVolunteerIds = volunteersInMinistries.map((v) => v.id);
    }

    // 3️⃣ Merge volunteers with attendance info
    const mergedVolunteers = event.volunteers
      .filter(
        (ev) =>
          !allowedVolunteerIds || allowedVolunteerIds.includes(ev.volunteerId),
      )
      .map((ev) => {
        const attendanceRecord = event.attendance.find(
          (a) => a.volunteerId === ev.volunteerId,
        );

        return {
          id: attendanceRecord?.id ?? 0, // 0 if no attendance exists yet
          volunteer: {
            id: ev.volunteer.id,
            firstName: ev.volunteer.firstName,
            lastName: ev.volunteer.lastName,
          },
          status: attendanceRecord?.status ?? "PENDING",
          response: attendanceRecord?.response ?? "NO_RESPONSE",
          session: attendanceRecord?.session ?? "AM",
        };
      });

    return NextResponse.json({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      archived: event.archived,
      createdAt: event.createdAt,
      status: event.status,
      ministryId: event.ministryId,
      volunteers: mergedVolunteers,
    });
  } catch (error) {
    console.error("GET /api/events/[id] error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH attendance
export async function PATCH(
  _req: Request,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const { id } = await Promise.resolve(context.params);
    const eventId = Number(id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "Invalid event id" },
        { status: 400 },
      );
    }

    const session = await getSession();
    if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const body = await _req.json();
    const data = AttendanceUpdateSchema.parse(body);

    // Update attendance
    const updated = await prisma.eventAttendance.update({
      where: { id: data.attendanceId },
      data: {
        session: data.session,
        status: data.status,
        response: data.response,
      },
      include: {
        volunteer: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/events/[id] error:", error);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}
