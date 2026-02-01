import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

// ----- ZOD VALIDATION -----
const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ----- RATE LIMITING -----
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 1000; // 1 minute

const ipAttempts = new Map<string, number[]>();

function rateLimit(ip: string) {
  const now = Date.now();
  const timestamps = ipAttempts.get(ip) || [];

  const fresh = timestamps.filter((t) => now - t < RATE_WINDOW);
  fresh.push(now);

  ipAttempts.set(ip, fresh);
  return fresh.length > RATE_LIMIT;
}

// ----- GET CLIENT IP -----
function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1"
  );
}

// ----- JWT CONFIG -----
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "superrefreshkey";

const ACCESS_EXPIRES = "55m"; // access token life
const REFRESH_EXPIRES = "7d"; // refresh token life in JWT (not DB exp)

// ================= LOGIN ROUTE ================= //

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);

    // ----- RATE LIMIT -----
    if (rateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    // ----- VALIDATE INPUT -----
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // ----- FIND USER -----
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // ----- GENERATE TOKENS -----
    const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: ACCESS_EXPIRES,
    });

    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_EXPIRES,
    });

    // ----- SAVE REFRESH TOKEN IN DB -----
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // ----- BUILD RESPONSE -----
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // ----- SET ACCESS TOKEN COOKIE -----
    response.cookies.set({
      name: "access_token",
      value: accessToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    // ----- SET REFRESH TOKEN COOKIE -----
    response.cookies.set({
      name: "refresh_token",
      value: refreshToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("[LOGIN_ERROR]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
