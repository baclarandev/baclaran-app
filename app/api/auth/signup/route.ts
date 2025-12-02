import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ----- ZOD SCHEMA -----
const SignupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ----- RATE LIMIT -----
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 1000;
const ipRequests = new Map<string, number[]>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipRequests.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW);

  recent.push(now);
  ipRequests.set(ip, recent);

  return recent.length > RATE_LIMIT;
}

function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1"
  );
}

// ----------------- SIGNUP ROUTE -------------------

export async function POST(req: Request) {
  try {
    const ip = getClientIP(req);
    if (rateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }

    const json = await req.json();
    const parsed = SignupSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered." },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "VOLUNTEER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Signup successful", user: newUser },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[SIGNUP_ERROR]", err);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: err.message, // <- TEMP: show actual problem
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Signup OK" });
}
