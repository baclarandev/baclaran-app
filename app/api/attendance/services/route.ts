import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { volunteerId, ministryId, day, month, year, timeIn, timeOut } = body;

    if (!volunteerId || !day || !month || !year) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const service = await prisma.volunteerServiceRecord.upsert({
      where: {
        volunteerId_year: {
          volunteerId,
          year,
        },
      },
      create: {
        volunteerId,
        year,
        attended: 1,
      },
      update: {
        attended: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(service);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 },
    );
  }
}
