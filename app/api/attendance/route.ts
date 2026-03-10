import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type AttendanceTypeEnum = "DAILY" | "MONTHLY_MEETING";
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 10);
    const month = Number(url.searchParams.get("month"));
    const year = Number(url.searchParams.get("year"));
    const ministryId = url.searchParams.get("ministryId");

    const where: any = {};

    if (ministryId) {
      where.ministryId = Number(ministryId);
    }

    const skip = (page - 1) * limit;

    const volunteers = await prisma.volunteer.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        lastName: "asc",
      },
      include: {
        attendances: {
          where: {
            month,
            year,
          },
        },
        Ministry: true,
      },
    });

    const total = await prisma.volunteer.count({ where });

    const formatted = volunteers.map((v) => {
      const days: number[] = [];

      v.attendances
        .filter((a) => a.type === "DAILY")
        .forEach((a) => {
          if (a.day) {
            days[a.day - 1] = a.presentCount ?? 0;
          }
        });

      const meeting = v.attendances.find((a) => a.type === "MONTHLY_MEETING");

      return {
        id: v.id,
        name: `${v.firstName} ${v.lastName}`,
        ministryId: v.ministryId,
        ministry: v.Ministry?.name,
        days,
        monthlyMeeting: meeting?.present ? "P" : "A",
      };
    });

    return NextResponse.json({
      volunteers: formatted,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 },
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { volunteerId, ministryId, days, monthlyMeeting, remarks } = body;

    if (!volunteerId) {
      return NextResponse.json(
        { error: "Volunteer ID required" },
        { status: 400 },
      );
    }

    const url = new URL(req.url);
    const month = Number(url.searchParams.get("month"));
    const year = Number(url.searchParams.get("year"));

    const records: any[] = [];

    /* DAILY ATTENDANCE */
    days.forEach((count: number, index: number) => {
      const safeCount = Math.min(count ?? 0, 8);

      records.push({
        volunteerId,
        ministryId,
        type: "DAILY" as AttendanceTypeEnum,
        day: index + 1,
        presentCount: safeCount,
        present: safeCount > 0,
        month,
        year,
        remarks: remarks ?? "",
        week: 0,
      });
    });

    /* MONTHLY MEETING */
    records.push({
      volunteerId,
      ministryId,
      type: "MONTHLY_MEETING" as AttendanceTypeEnum,
      day: 0,
      presentCount: monthlyMeeting ? 1 : 0,
      present: !!monthlyMeeting,
      month,
      year,
      remarks: remarks ?? "",
      week: 0,
    });

    await prisma.$transaction(
      records.map((r) =>
        prisma.volunteerAttendance.upsert({
          where: {
            volunteerId_type_week_month_year_day: {
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to save attendance" },
      { status: 500 },
    );
  }
}
