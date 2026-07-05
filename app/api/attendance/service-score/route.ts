import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* =========================
   GET - Leaderboard
========================= */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const ministryId = searchParams.get("ministryId");

    const ministryFilter = ministryId
      ? `WHERE vss."ministryId" = ${Number(ministryId)}`
      : "";

    const result = await prisma.$queryRawUnsafe(`
      SELECT
        v.id,
        v."firstName" || ' ' || v."lastName" AS name,
        COALESCE(SUM(c.weight), 0) AS service
      FROM "Volunteer" v
      LEFT JOIN "VolunteerServiceSession" vss
        ON vss."volunteerId" = v.id
      LEFT JOIN "Criteria" c
        ON c.title = vss.role
        AND c."ministryId" = vss."ministryId"
      ${ministryFilter}
      GROUP BY v.id
      ORDER BY service DESC;
    `);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load service score" },
      { status: 500 },
    );
  }
}

/* =========================
   POST - Add Service Session
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { volunteerId, ministryId, role, day, month, year, timeIn, timeOut } =
      body;

    const service = await prisma.volunteerServiceSession.create({
      data: {
        volunteerId,
        ministryId,
        role,
        day,
        month,
        year,
        timeIn: timeIn ? new Date(timeIn) : null,
        timeOut: timeOut ? new Date(timeOut) : null,
      },
    });

    return NextResponse.json({
      message: "Service recorded",
      service,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save service" },
      { status: 500 },
    );
  }
}
