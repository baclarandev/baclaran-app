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
        ministryId: true,
        createdAt: true,
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

  // 🔒 Admin only
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { email, password, role } = body as {
    email: string;
    password: string;

    role: Role;
  };

  // ✅ Allowed roles only
  if (!["ADMIN", "CHAIRMAN", "STAFF"].includes(role)) {
    return NextResponse.json({ message: "Invalid role" }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json(
      { message: "Missing required fields" },
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
    },
  });

  return NextResponse.json(
    {
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    },
    { status: 201 },
  );
}
