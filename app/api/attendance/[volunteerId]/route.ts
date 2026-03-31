import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type VolunteerAttendancePayload = {
  days: number[]; // daily attendance
  monthlyMeeting: "P" | "E" | "A";
  ministryId: number;
  month: number;
  year: number;
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { volunteerId: string } },
) {
  try {
    const volunteerId = Number(params.volunteerId);
    if (isNaN(volunteerId)) {
      return NextResponse.json(
        { error: "Invalid volunteerId" },
        { status: 400 },
      );
    }

    const body: VolunteerAttendancePayload = await req.json();
    const { days, monthlyMeeting, ministryId, month, year } = body;

    // Update daily attendance
    for (let i = 0; i < days.length; i++) {
      await prisma.volunteerAttendance.upsert({
        where: {
          volunteerId_type_week_month_year_day: {
            volunteerId,
            type: "DAILY",
            week: null as number | null, // <- cast
            month,
            year,
            day: i + 1,
          },
        },
        create: {
          volunteerId,
          ministryId,
          type: "DAILY",
          month,
          year,
          day: i + 1,
          presentCount: days[i],
          present: days[i] > 0,
        },
        update: {
          presentCount: days[i],
          present: days[i] > 0,
        },
      });

      // Monthly meeting
      await prisma.volunteerAttendance.upsert({
        where: {
          volunteerId_type_week_month_year_day: {
            volunteerId,
            type: "MONTHLY_MEETING",
            week: null as number | null, // <- cast
            month,
            year,
            day: null as number | null, // <- cast
          },
        },
        create: {
          volunteerId,
          ministryId,
          type: "MONTHLY_MEETING",
          month,
          year,
          day: null,
          monthlyServed: monthlyMeeting === "P" ? 1 : 0,
          present: monthlyMeeting === "P",
        },
        update: {
          monthlyServed: monthlyMeeting === "P" ? 1 : 0,
          present: monthlyMeeting === "P",
        },
      });
    }

    // Update monthly meeting attendance
    await prisma.volunteerAttendance.upsert({
      where: {
        volunteerId_type_week_month_year_day: {
          volunteerId,
          type: "MONTHLY_MEETING",
          week: null,
          month,
          year,
          day: null,
        },
      },
      create: {
        volunteerId,
        ministryId,
        type: "MONTHLY_MEETING",
        month,
        year,
        day: null,
        monthlyServed: monthlyMeeting === "P" ? 1 : 0,
        present: monthlyMeeting === "P", // required Boolean
      },
      update: {
        monthlyServed: monthlyMeeting === "P" ? 1 : 0,
        present: monthlyMeeting === "P",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
