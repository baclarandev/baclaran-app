import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

// ================= ZOD VALIDATION =================
const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email format"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

// ================= RATE LIMIT =================
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 1000;

const ipAttempts = new Map<string, number[]>();

function rateLimit(ip: string) {
  const now = Date.now();
  const timestamps = ipAttempts.get(ip) || [];

  const fresh = timestamps.filter((t) => now - t < RATE_WINDOW);
  fresh.push(now);

  ipAttempts.set(ip, fresh);
  return fresh.length > RATE_LIMIT;
}

// ================= GET CLIENT IP =================
function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1"
  );
}

// ================= JWT CONFIG =================
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "superrefreshkey";

const ACCESS_EXPIRES = "45d";
const REFRESH_EXPIRES = "45d";

// ================= LOGIN ROUTE =================

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIP(req);

    // -------- RATE LIMIT --------
    if (rateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 1 minute." },
        { status: 429 },
      );
    }

    // -------- PARSE BODY --------
    const body = await req.json();

    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;

      return NextResponse.json(
        {
          error: "Validation failed",
          fields: errors,
        },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const password = parsed.data.password;

    // -------- FIND USER --------
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // SECURITY: do not reveal if email exists
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // -------- CHECK PASSWORD --------
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // -------- GENERATE TOKENS --------
    const accessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: ACCESS_EXPIRES,
    });

    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_EXPIRES,
    });

    // -------- SAVE REFRESH TOKEN --------
    const expiresAt = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // -------- RESPONSE --------
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // -------- ACCESS TOKEN COOKIE --------
    response.cookies.set({
      name: "access_token",
      value: accessToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 45,
    });

    // -------- REFRESH TOKEN COOKIE --------
    response.cookies.set({
      name: "refresh_token",
      value: refreshToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 45,
    });

    return response;
  } catch (err) {
    console.error("[LOGIN_ERROR]", err);

    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }
}
