import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
/* =========================================================
   GET ATTENDANCE (TABLE DATA)
========================================================= */
export async function GET(req: NextRequest) {
  const sessionUser = await getSession();

  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  const skip = (page - 1) * limit;

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

  const total = await prisma.volunteer.count({ where: whereClause });

  const volunteers = await prisma.volunteer.findMany({
    where: whereClause,
    skip,
    take: limit,
    orderBy: { lastName: "asc" },
    include: {
      attendances: {
        where: {
          month,
          year,
          type: "DAILY",
        },
        orderBy: {
          serviceOrder: "asc",
        },
      },
      ministryHistories: {
        where: { status: "ACTIVE" },
      },
    },
  });

  const daysInMonth = new Date(year, month, 0).getDate();

  const data = volunteers.map((v) => {
    // group by day
    const grouped = new Map<number, any[]>();

    v.attendances.forEach((a) => {
      const day = a.day!;
      if (!grouped.has(day)) grouped.set(day, []);
      grouped.get(day)!.push(a);
    });

    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;

      const services = grouped.get(day) ?? [];

      return {
        day,
        services: services.map((s) => ({
          serviceOrder: s.serviceOrder ?? 1,
          timeIn: s.timeIn,
          timeOut: s.timeOut,
          presentCount: s.presentCount ?? 0,
        })),
      };
    });

    return {
      id: v.id,
      firstName: v.firstName,
      lastName: v.lastName,
      ministryId:
        sessionUser.role === "ADMIN"
          ? (v.ministryHistories?.[0]?.ministryId ?? null)
          : sessionUser.ministryId,
      days,
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

  // =========================
  // 1. FULL SESSION (BEST CASE)
  // =========================
  if (timeIn && timeOut) {
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
        timeIn: new Date(timeIn),
        timeOut: new Date(timeOut),
      },
    });

    return NextResponse.json({
      success: true,
      action: "FULL_SESSION",
      attendance: created,
    });
  }

  // =========================
  // 2. FIND ACTIVE SESSION
  // =========================
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
  // 3. CLOSE ONLY
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
  // 4. AUTO CLOSE OLD SESSION
  // =========================
  if (active) {
    await prisma.volunteerAttendance.update({
      where: { id: active.id },
      data: {
        timeOut: new Date(),
      },
    });
  }

  // =========================
  // 5. CREATE NEW SESSION (TIME IN ONLY)
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
