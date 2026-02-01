import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { ROLE_LEVEL, hasLevel } from "@/lib/rbac";
import { z } from "zod";

// ─── ZOD SCHEMA ─────────────────────────
const MinistrySchema = z.object({
  name: z.string().min(2),
  icon: z.string().optional(),
  type: z.enum(["LITURGICAL", "PASTORAL"]), // 👈 added
});

// ─── GET MINISTRIES ─────────────────────────
export async function GET() {
  try {
    const ministries = await prisma.ministry.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        icon: true,
        type: true, // 👈 added
        volunteers: {
          where: { status: "ACTIVE" },
          select: {
            volunteer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            joinedAt: true,
            leftAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Ministries fetched successfully",
      data: ministries,
    });
  } catch (err: any) {
    console.error("[GET_MINISTRIES_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to fetch ministries", details: err.message },
      { status: 500 },
    );
  }
}

// ─── CREATE MINISTRY ───────────────────────
export async function POST(req: Request) {
  const user = await getSession();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasLevel(user, ROLE_LEVEL.ADMIN))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = MinistrySchema.safeParse(body);

  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );

  try {
    const ministry = await prisma.ministry.create({
      data: {
        name: parsed.data.name,
        icon: parsed.data.icon || "Church",
        type: parsed.data.type, // 👈 saved here
      },
    });

    return NextResponse.json(
      { message: "Ministry created successfully", data: ministry },
      { status: 201 },
    );
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: `Ministry "${parsed.data.name}" already exists` },
        { status: 400 },
      );
    }

    console.error("[CREATE_MINISTRY_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to create ministry", details: err.message },
      { status: 500 },
    );
  }
}
