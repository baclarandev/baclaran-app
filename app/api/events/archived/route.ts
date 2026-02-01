import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10");

  // Validate pagination params
  if (page < 1 || pageSize < 1) {
    return NextResponse.json(
      { message: "Invalid pagination parameters" },
      { status: 400 },
    );
  }

  try {
    const skip = (page - 1) * pageSize;

    const [archivedEvents, totalCount] = await Promise.all([
      prisma.event.findMany({
        where: { archived: true },
        orderBy: { startDate: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.event.count({ where: { archived: true } }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      data: archivedEvents,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching archived events:", error);
    return NextResponse.json(
      { message: "Failed to fetch archived events" },
      { status: 500 },
    );
  }
}
