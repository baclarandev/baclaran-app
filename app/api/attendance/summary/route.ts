import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const sessionUser = await getSession();

  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;

  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 50;

  const skip = (page - 1) * limit;

  // =========================
  // WHERE CLAUSE
  // =========================
  const whereClause =
    sessionUser.role === "ADMIN"
      ? {}
      : sessionUser.ministryId
        ? {
            ministryHistories: {
              some: {
                ministryId: sessionUser.ministryId,
                status: "ACTIVE",
              },
            },
          }
        : { id: -1 };

  // =========================
  // TOTAL COUNT
  // =========================
  const total = await prisma.volunteer.count({
    where: whereClause,
  });

  // =========================
  // VOLUNTEERS (paginated)
  // =========================
  const volunteers = await prisma.volunteer.findMany({
    where: whereClause,
    skip,
    take: limit,
    orderBy: { lastName: "asc" },
  });

  const volunteerIds = volunteers.map((v) => v.id);

  // =========================
  // ATTENDANCE
  // =========================
  const attendances = await prisma.volunteerAttendance.findMany({
    where: {
      month,
      year,
      type: "DAILY",
      volunteerId: { in: volunteerIds },
    },
  });

  // =========================
  // SUMMARY (remarks source)
  // =========================
  const summaries = await prisma.volunteerAttendanceSummary.findMany({
    where: {
      month,
      year,
      volunteerId: { in: volunteerIds },
    },
  });

  const summaryMap = new Map(summaries.map((s) => [s.volunteerId, s]));

  // =========================
  // COUNT ATTENDANCE
  // =========================
  const attendanceMap = new Map<number, number>();

  for (const a of attendances) {
    if (!a.timeIn) continue;

    attendanceMap.set(
      a.volunteerId,
      (attendanceMap.get(a.volunteerId) ?? 0) + 1,
    );
  }

  // =========================
  // BUILD RESPONSE
  // =========================
  const data = volunteers.map((v) => {
    const attended = attendanceMap.get(v.id) ?? 0;
    const commitment = 5;
    const absences = Math.max(commitment - attended, 0);

    const summary = summaryMap.get(v.id);

    return {
      volunteerId: v.id,
      name: `${v.firstName} ${v.lastName}`,
      yearStarted: v.joinedYearMinistry ?? null,
      monthlyMeeting: summary ? summary.monthlyMeeting : "ABSENT",
      remarks: summary?.remarks ?? "", // ✅ FIXED

      commitment,
      attended,
      absences,

      status: v.status,
    };
  });

  return NextResponse.json({
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
export async function POST(req: NextRequest) {
  const body = await req.json();

  const { volunteerId, ministryId, day, month, year, timeIn, timeOut } = body;

  // 1. find active session (open)
  const active = await prisma.volunteerAttendance.findFirst({
    where: {
      volunteerId,
      day,
      month,
      year,
      type: "DAILY",
      timeOut: null,
    },
    orderBy: {
      serviceOrder: "desc",
    },
  });

  // =========================
  // CLOSE ONLY
  // =========================
  if (timeOut && active) {
    const updated = await prisma.volunteerAttendance.update({
      where: { id: active.id },
      data: {
        timeOut: new Date(timeOut),
      },
    });

    return NextResponse.json({
      success: true,
      action: "CLOSE",
      attendance: updated,
    });
  }

  // =========================
  // AUTO CLOSE OLD SESSION (if exists)
  // =========================
  if (active && !active.timeOut) {
    await prisma.volunteerAttendance.update({
      where: { id: active.id },
      data: {
        timeOut: new Date(),
      },
    });
  }

  // =========================
  // CREATE NEW SESSION
  // =========================
  const last = await prisma.volunteerAttendance.findFirst({
    where: { volunteerId, day, month, year, type: "DAILY" },
    orderBy: { serviceOrder: "desc" },
  });

  const nextOrder = (last?.serviceOrder ?? 0) + 1;

  const created = await prisma.volunteerAttendance.create({
    data: {
      volunteerId,
      ministryId,
      type: "DAILY",
      day,
      month,
      year,
      present: true,
      presentCount: 1,
      serviceOrder: nextOrder,
      timeIn: timeIn ? new Date(timeIn) : new Date(),
      timeOut: null,
    },
  });

  return NextResponse.json({
    success: true,
    action: "NEW_SERVICE",
    attendance: created,
  });
}
export async function PUT(req: NextRequest) {
  const sessionUser = await getSession();

  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { volunteerId, remarks, month, year } = body;

  // =========================
  // VALIDATION
  // =========================
  if (!volunteerId || !month || !year) {
    return NextResponse.json(
      { error: "volunteerId, month, and year are required" },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.volunteerAttendanceSummary.upsert({
      where: {
        volunteer_summary_unique: {
          volunteerId,
          month,
          year,
        },
      },
      update: {
        remarks,
      },
      create: {
        volunteerId,
        month,
        year,
        remarks,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("PUT ERROR:", error);

    return NextResponse.json(
      { error: "Failed to save remarks" },
      { status: 500 },
    );
  }
}
