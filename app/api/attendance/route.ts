// app/api/attendance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { ministryId, month, year } = Object.fromEntries(
      req.nextUrl.searchParams,
    ) as { ministryId?: string; month?: string; year?: string };

    const currentDate = new Date();
    const selectedMonth = month ? Number(month) : currentDate.getMonth() + 1;
    const selectedYear = year ? Number(year) : currentDate.getFullYear();

    if (isNaN(selectedMonth) || isNaN(selectedYear)) {
      return NextResponse.json(
        { error: "Invalid month or year" },
        { status: 400 },
      );
    }

    const limit = Number(req.nextUrl.searchParams.get("limit")) || 10;
    const page = Number(req.nextUrl.searchParams.get("page")) || 1;
    const skip = (page - 1) * limit;

    const whereClause =
      ministryId && ministryId !== "all"
        ? { ministryId: Number(ministryId) }
        : {};

    // ✅ COUNT TOTAL (IMPORTANT)
    const total = await prisma.volunteer.count({
      where: whereClause,
    });

    // ✅ FETCH PAGINATED DATA
    const volunteers = await prisma.volunteer.findMany({
      where: whereClause,
      include: {
        attendances: {
          where: {
            month: selectedMonth,
            year: selectedYear,
          },
        },
      },
      orderBy: {
        lastName: "asc",
      },
      skip,
      take: limit,
    });

    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    const data = volunteers.map((v) => {
      const dailyAttendance = Array.from({ length: daysInMonth }, (_, i) => {
        const record = v.attendances.find(
          (a) => a.type === "DAILY" && a.day === i + 1,
        );
        return record?.presentCount ?? 0;
      });

      const monthlyRecord = v.attendances.find(
        (a) => a.type === "MONTHLY_MEETING",
      );

      // const monthlyMeeting =
      //   monthlyRecord && monthlyRecord.monthlyServed > 0 ? "P" : "A";

      return {
        id: v.id,
        firstName: v.firstName,
        lastName: v.lastName,
        ministryId: v.ministryId,
        days: dailyAttendance,
        // monthlyMeeting,
      };
    });

    // ✅ RETURN WITH PAGINATION
    return NextResponse.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
