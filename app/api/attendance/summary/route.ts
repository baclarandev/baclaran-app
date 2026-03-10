import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const month = Number(url.searchParams.get("month"));
    const year = Number(url.searchParams.get("year"));
    const ministryId = url.searchParams.get("ministryId");

    const volunteers = await prisma.volunteer.findMany({
      where: ministryId
        ? { ministryId: Number(ministryId) }
        : {},
      include: {
        attendances: {
          where: {
            month,
            year,
          },
        },
        Ministry: true,
      },
      orderBy: {
        lastName: "asc",
      },
    });

    const summary = volunteers.map((v) => {
      const daily = v.attendances.filter(
        (a) => a.type === "DAILY",
      );

      const meeting = v.attendances.find(
        (a) => a.type === "MONTHLY_MEETING",
      );

      const monthlyServed = daily.reduce(
        (sum, d) => sum + (d.presentCount ?? 0),
        0,
      );

      const absences = daily.filter(
        (d) => (d.presentCount ?? 0) === 0,
      ).length;

      return {
        volunteerId: v.id,
        name: `${v.firstName} ${v.lastName}`,
        volunteerCode: v.volunteerCode,
        ministry: v.Ministry?.name,
        monthlyServed,
        absences,
        meeting: meeting?.present ? "Present" : "Absent",
      };
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 },
    );
  }
}