import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import { hasLevel, ROLE_LEVEL } from "@/lib/rbac";

/* ───────────── SCHEMA ───────────── */

const UpdateSchema = z.object({
  name: z.string().min(2),
});

/* ───────────── UPDATE ───────────── */

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getSession();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasLevel(user, ROLE_LEVEL.ADMIN))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params; // ✅ FIX
  const body = await req.json();

  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );

  try {
    const ministry = await prisma.ministry.update({
      where: { id: Number(id) },
      data: { name: parsed.data.name },
    });

    return NextResponse.json(ministry);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update ministry" },
      { status: 500 },
    );
  }
}

/* ───────────── DELETE ───────────── */

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getSession();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasLevel(user, ROLE_LEVEL.ADMIN))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await context.params; // ✅ FIX

  try {
    await prisma.ministry.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete ministry" },
      { status: 500 },
    );
  }
}
export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getSession();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const ministryId = Number(id);

  if (isNaN(ministryId))
    return NextResponse.json({ error: "Invalid ministry ID" }, { status: 400 });

  try {
    const members = await prisma.volunteerMinistryHistory.findMany({
      where: {
        ministryId,
        status: "ACTIVE",
      },
      include: {
        volunteer: true,
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    // flatten response
    const volunteers = members.map((m) => m.volunteer);

    return NextResponse.json(volunteers);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch ministry volunteers" },
      { status: 500 },
    );
  }
}
