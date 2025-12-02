import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "POST GET endpoint",
  });
}
