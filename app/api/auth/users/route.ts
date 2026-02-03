import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        ministry: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { email, password, role, ministryId } = body as {
    email: string;
    password: string;
    role: Role;
    ministryId?: number | null;
  };

  if (!["ADMIN", "CHAIRMAN", "STAFF"].includes(role)) {
    return NextResponse.json({ message: "Invalid role" }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json(
      { message: "Missing required fields" },
      { status: 400 },
    );
  }

  if (role === "STAFF" && ministryId == null) {
    return NextResponse.json(
      { message: "Staff must be assigned to a ministry" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return NextResponse.json(
      { message: "Email already exists" },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      role,
      password: hashedPassword,
      ministryId: ministryId ?? null,
    },
  });

  return NextResponse.json(
    {
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        ministryId: user.ministryId,
      },
    },
    { status: 201 },
  );
}
