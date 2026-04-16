import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSession();

    if (!sessionUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);

    const month = Number(url.searchParams.get("month"));
    const year = Number(url.searchParams.get("year"));
    const ministryIdParam = url.searchParams.get("ministryId");

    // ✅ FIXED
    let ministryFilter: number | null = null;

    if (sessionUser.role === "STAFF") {
      // 🔒 force staff to their ministry
      ministryFilter = sessionUser.ministryId ?? null;
    } else if (sessionUser.role === "ADMIN" && ministryIdParam) {
      ministryFilter = Number(ministryIdParam);
    }

    const volunteers = await prisma.volunteer.findMany({
      where: ministryFilter
        ? {
            ministryHistories: {
              some: {
                ministryId: ministryFilter,
                status: "ACTIVE",
              },
            },
          }
        : {},
      include: {
        attendances: {
          where: { month, year },
        },
        ministryHistories: {
          where: { status: "ACTIVE" },
          include: { ministry: true },
          orderBy: { joinedAt: "desc" },
        },
      },
      orderBy: { lastName: "asc" },
    });

    const summary = volunteers.map((v) => {
      const daily = v.attendances.filter((a) => a.type === "DAILY");
      const meeting = v.attendances.find((a) => a.type === "MONTHLY_MEETING");

      const currentMinistry = v.ministryHistories.find(
        (m) => m.status === "ACTIVE",
      )?.ministry;

      return {
        volunteerId: v.id,
        name: `${v.firstName} ${v.lastName}`,
        ministry: currentMinistry?.name || "No Ministry",
        yearStarted: v.joinedYearMinistry ?? v.joinedYearShrine ?? "N/A",
        monthlyServed: daily.reduce((sum, d) => sum + (d.presentCount ?? 0), 0),
        absences: daily.filter((d) => (d.presentCount ?? 0) === 0).length,
        status: v.ministryHistories[0]?.status || "N/A",
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
