import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    // 🔥 Revoke refresh token in DB
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
          id: number;
        };

        await prisma.refreshToken.updateMany({
          where: {
            userId: decoded.id,
            token: refreshToken,
            revoked: false,
          },
          data: {
            revoked: true,
          },
        });
      } catch {
        // token invalid or expired — ignore
      }
    }

    // 🧹 Clear cookies
    const response = NextResponse.json({ message: "Logged out" });

    response.cookies.set({
      name: "access_token",
      value: "",
      path: "/",
      maxAge: 0,
    });

    response.cookies.set({
      name: "refresh_token",
      value: "",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err) {
    console.error("[LOGOUT_ERROR]", err);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
