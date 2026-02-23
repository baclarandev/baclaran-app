import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type AttendanceTypeEnum = "DAILY" | "MONTHLY_MEETING";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    // Get month/year from query params or default to current
    const url = new URL(req.url);
    const queryMonth = url.searchParams.get("month");
    const queryYear = url.searchParams.get("year");

    const now = new Date();
    const month = queryMonth ? Number(queryMonth) : now.getMonth() + 1;
    const year = queryYear ? Number(queryYear) : now.getFullYear();

    const records: any[] = [];

    // Build attendance records
    body.forEach((member) => {
      const ministryId = member.ministryId ?? 1;

      // DAILY attendance
      if (Array.isArray(member.days)) {
        member.days.forEach(
          (count: number | null | undefined, index: number) => {
            const safeCount = Math.min(count ?? 0, 8);
            records.push({
              volunteerId: member.volunteerId,
              ministryId,
              type: "DAILY" as AttendanceTypeEnum,
              day: index + 1,
              presentCount: safeCount,
              present: safeCount > 0,
              month,
              year,
              remarks: member.remarks ?? "",
              week: 0, // You can calculate week if needed
            });
          },
        );
      }

      // MONTHLY_MEETING attendance (day = 0)
      records.push({
        volunteerId: member.volunteerId,
        ministryId,
        type: "MONTHLY_MEETING" as AttendanceTypeEnum,
        day: 0,
        presentCount: member.monthlyMeeting ? 1 : 0,
        present: !!member.monthlyMeeting,
        month,
        year,
        remarks: member.remarks ?? "",
        week: 0,
      });
    });

    // Upsert all attendance records in a transaction
    await prisma.$transaction(
      records.map((r) =>
        prisma.volunteerAttendance.upsert({
          where: {
            volunteerId_type_week_month_year_day: {
              // unique key
              // unique key includes `day`
              volunteerId: r.volunteerId,
              type: r.type,
              week: r.week,
              month: r.month,
              year: r.year,
              day: r.day,
            },
          },
          update: {
            present: r.present,
            presentCount: r.presentCount,
            remarks: r.remarks,
          },
          create: r,
        }),
      ),
    );

    const volunteerIds = [...new Set(body.map((m) => m.volunteerId))];

    // Update summary for each volunteer
    for (const volunteerId of volunteerIds) {
      const attendances = await prisma.volunteerAttendance.findMany({
        where: { volunteerId, month, year },
        select: { day: true, presentCount: true },
        orderBy: { day: "asc" },
      });

      const monthlyServed = attendances.reduce(
        (sum, a) => sum + (a.presentCount ?? 0),
        0,
      );

      const allTimeAttendances = await prisma.volunteerAttendance.findMany({
        where: { volunteerId },
        select: { presentCount: true },
      });

      const totalServe = allTimeAttendances.reduce(
        (sum, a) => sum + (a.presentCount ?? 0),
        0,
      );

      // Build served array for JSON
      const served = attendances.map((a) => ({
        day: a.day,
        serve: a.presentCount ?? 0,
        month,
        year,
      }));

      await prisma.volunteerAttendanceSummary.upsert({
        where: { volunteer_summary_unique: { volunteerId, month, year } },
        update: { monthlyServed, totalServe, served },
        create: { volunteerId, month, year, monthlyServed, totalServe, served },
      });
    }

    // Return summaries for the month/year
    const summaries = await prisma.volunteerAttendanceSummary.findMany({
      where: { month, year },
      select: {
        volunteerId: true,
        monthlyServed: true,
        totalServe: true,
        served: true,
      },
    });

    return NextResponse.json({ success: true, month, year, summaries });
  } catch (error) {
    console.error("Batch attendance error:", error);
    return NextResponse.json(
      { error: "Failed to save attendance" },
      { status: 500 },
    );
  }
}
