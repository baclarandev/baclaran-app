import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
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
export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSession();
    if (!sessionUser)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const where: any = {};
    if (sessionUser.role === "STAFF") {
      if (!sessionUser.ministryId)
        return NextResponse.json(
          { error: "Staff has no ministry assigned" },
          { status: 403 },
        );
      where.id = sessionUser.ministryId; // filter only their ministry
    }

    const ministries = await prisma.ministry.findMany({
      where,
      include: {
        volunteers: true, // include volunteers
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: ministries });
  } catch (err: any) {
    console.error("[GET_MINISTRIES_ERROR]", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch ministries" },
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
