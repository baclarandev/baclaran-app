import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSession();

    if (!sessionUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!can.isStaff(sessionUser))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);

    /* =============== DATE PARAMS =============== */
    const month = Number(
      searchParams.get("month") ?? new Date().getMonth() + 1,
    );
    const year = Number(searchParams.get("year") ?? new Date().getFullYear());

    /* =============== PAGINATION =============== */
    const page = Math.max(Number(searchParams.get("page") ?? 1), 1);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") ?? 10), 1),
      100,
    );
    const skip = (page - 1) * limit;

    /* =============== MINISTRY FILTER =============== */
    const ministryIdParam = searchParams.get("ministryId");
    const ministryId = ministryIdParam ? Number(ministryIdParam) : undefined;

    const volunteerWhere: any = {};

    // STAFF → force ministry
    if (sessionUser.role === "STAFF") {
      if (!sessionUser.ministryId) {
        return NextResponse.json(
          { error: "Staff has no ministry assigned" },
          { status: 403 },
        );
      }
      volunteerWhere.ministryHistories = {
        some: { ministryId: sessionUser.ministryId, status: "ACTIVE" },
      };
    }
    // ADMIN → optional filter
    else if (ministryId) {
      volunteerWhere.ministryHistories = {
        some: { ministryId, status: "ACTIVE" },
      };
    }

    /* =============== COUNT =============== */
    const totalRows = await prisma.volunteer.count({ where: volunteerWhere });

    /* =============== FETCH VOLUNTEERS =============== */
    const volunteers = await prisma.volunteer.findMany({
      where: volunteerWhere,
      orderBy: { id: "asc" },
      skip,
      take: limit,
    });

    const volunteerIds = volunteers.map((v) => v.id);

    /* =============== FETCH DAILY ATTENDANCE =============== */
    const attendance = await prisma.volunteerAttendance.findMany({
      where: {
        volunteerId: { in: volunteerIds },
        month,
        year,
      },
    });

    const totalDays = new Date(year, month, 0).getDate();

    /* =============== BUILD RESPONSE =============== */
    const data = volunteers.map((v) => {
      // Initialize daily array with zeros
      const days = Array(totalDays).fill(0);
      let monthlyMeeting = false;

      // Fill attendance data safely
      attendance
        .filter((a) => a.volunteerId === v.id)
        .forEach((att) => {
          if (att.day === 0) {
            monthlyMeeting = att.present;
          } else if (att.day !== null && att.day >= 1 && att.day <= totalDays) {
            // ✅ Only use day if it's not null
            days[att.day - 1] = att.presentCount ?? 0;
          }
        });

      const totalAttendance =
        days.reduce((a, b) => a + b, 0) + (monthlyMeeting ? 1 : 0);
      const totalPossible = totalDays * 8 + 1; // 8 max per day + 1 for monthly meeting

      return {
        id: v.id,
        firstName: v.firstName,
        lastName: v.lastName,
        middleInitial: v.middleInitial,
        status: v.status,
        days,
        monthlyMeeting,
        totalAttendance,
        absences: Math.max(totalPossible - totalAttendance, 0),
        remarks: "",
      };
    });

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        totalRows,
        totalPages: Math.ceil(totalRows / limit),
      },
    });
  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 },
    );
  }
}
