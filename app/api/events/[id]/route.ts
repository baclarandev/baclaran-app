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
    const { id } = await Promise.resolve(context.params);
    const eventId = Number(id);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { message: "Invalid event id" },
        { status: 400 },
      );
    }

    // Fetch the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        ministryId: true,
        attendance: { include: { volunteer: true } },
      },
    });

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Fetch all relevant volunteers
    const volunteers = await prisma.volunteer.findMany({
      where: event.ministryId ? { Ministry: { id: event.ministryId } } : {},
      select: { id: true, firstName: true, lastName: true },
    });

    // Determine missing attendance
    const existingVolunteerIds = new Set(
      event.attendance.map((a) => a.volunteerId),
    );
    const missingVolunteers = volunteers.filter(
      (v) => !existingVolunteerIds.has(v.id),
    );

    // Create attendance records for missing volunteers
    const newAttendances = await Promise.all(
      missingVolunteers.map((v) =>
        prisma.eventAttendance.create({
          data: {
            eventId,
            volunteerId: v.id,
            session: "AM",
            status: "PENDING",
            response: "NO_RESPONSE",
          },
          include: {
            volunteer: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        }),
      ),
    );

    // Combine all attendance
    const attendance = [...event.attendance, ...newAttendances];

    return NextResponse.json({ ...event, attendance });
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
