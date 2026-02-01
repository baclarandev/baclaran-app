import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token)
      return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const booking = await prisma.massBooking.update({
      where: { qrToken: token },
      data: {
        status: "CHECKED_IN",
        servedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("[QR_CHECKIN_ERROR]", error);
    return NextResponse.json({ error: "Failed to check in" }, { status: 500 });
  }
}
