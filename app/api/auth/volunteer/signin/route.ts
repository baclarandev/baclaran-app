import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const TOKEN_EXPIRES_IN = "7d";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, volunteerCode, ministryId } = body;

    // ---------- VOLUNTEER LOGIN ----------
    if (volunteerCode) {
      const volunteer = await prisma.volunteer.findFirst({
        where: {
          volunteerCode,
          ...(ministryId ? { ministryId } : {}), // optional ministry check
        },
      });

      if (!volunteer) {
        return NextResponse.json(
          { error: "Invalid volunteer code or ministry" },
          { status: 401 },
        );
      }

      // Generate JWT for volunteer
      const token = jwt.sign(
        {
          id: volunteer.id,
          volunteerCode: volunteer.volunteerCode,
          role: "VOLUNTEER",
        },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRES_IN },
      );

      return NextResponse.json({
        token,
        role: "VOLUNTEER",
        volunteer,
      });
    }

    // ---------- LOGIN BY EMAIL (Admin or Volunteer) ----------
    if (email) {
      // Check if user exists in Admin table
      const admin = await prisma.user.findUnique({
        where: { email },
      });

      if (admin) {
        const token = jwt.sign(
          {
            id: admin.id,
            email: admin.email,
            role: admin.role,
          },
          JWT_SECRET,
          { expiresIn: TOKEN_EXPIRES_IN },
        );

        return NextResponse.json({
          token,
          role: admin.role,
          admin,
        });
      }

      // If not admin, check volunteer table by email
      const volunteer = await prisma.volunteer.findUnique({
        where: { email },
      });

      if (volunteer) {
        const token = jwt.sign(
          {
            id: volunteer.id,
            volunteerCode: volunteer.volunteerCode,
            role: "VOLUNTEER",
          },
          JWT_SECRET,
          { expiresIn: TOKEN_EXPIRES_IN },
        );

        return NextResponse.json({
          token,
          role: "VOLUNTEER",
          volunteer,
        });
      }

      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Missing login credentials" },
      { status: 400 },
    );
  } catch (err) {
    console.error("[LOGIN_ERROR]", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
