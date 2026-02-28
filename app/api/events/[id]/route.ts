import { z } from "zod";
import { AttendanceStatus, attendance_response } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

const AttendanceUpdateSchema = z.object({
  attendanceId: z.number(),
  session: z.enum(["AM", "PM"]).optional(),
  status: z.nativeEnum(AttendanceStatus).optional(),
  response: z.nativeEnum(attendance_response).optional(),
});

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

    // Fetch all volunteers in the ministry (or all if null)
    const volunteers = await prisma.volunteer.findMany({
      where: event.ministryId
        ? { Ministry: { id: event.ministryId } } // ✅ use the capitalized relation field
        : {}, // all volunteers
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    // Merge existing attendance or create new entries
    const attendance = volunteers.map((vol) => {
      const existing = event.attendance.find((a) => a.volunteerId === vol.id);
      return (
        existing ?? {
          id: -1, // temporary ID for new attendance (staff can create later)
          volunteer: vol,
          session: "AM",
          status: "PENDING" as AttendanceStatus,
          response: "NO_RESPONSE" as attendance_response,
        }
      );
    });

    return NextResponse.json({ ...event, attendance });
  } catch (error) {
    console.error("GET /api/events/[id] error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

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

    // Ensure attendance exists
    const attendance = await prisma.eventAttendance.findFirst({
      where: { id: data.attendanceId, eventId },
    });

    if (!attendance) {
      return NextResponse.json(
        { message: "Attendance not found in this event" },
        { status: 404 },
      );
    }

    const updated = await prisma.eventAttendance.update({
      where: { id: data.attendanceId },
      data: {
        session: data.session,
        status: data.status,
        response: data.response,
      },
      include: {
        volunteer: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/events/[id] error:", error);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}
