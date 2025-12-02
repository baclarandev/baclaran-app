import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "superrefreshkey";
const ACCESS_EXPIRES = "15m";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refresh_token")?.value;
    if (!refreshToken)
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });

    // Verify refresh token
    const decoded: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Check token matches DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        refreshTokens: true, // Now includes the array of tokens
      },
    });
    const isValidToken = user?.refreshTokens.some(
      (tokenRecord) =>
        tokenRecord.token === refreshToken && !tokenRecord.revoked
    );

    if (!user || !isValidToken) {
      // Check if user is null OR the token is invalid/missing
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: ACCESS_EXPIRES }
    );

    const response = NextResponse.json({ message: "Access token refreshed" });
    response.cookies.set({
      name: "access_token",
      value: newAccessToken,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 15,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err) {
    console.error("[REFRESH_ERROR]", err);
    return NextResponse.json(
      { error: "Invalid refresh token" },
      { status: 401 }
    );
  }
}
