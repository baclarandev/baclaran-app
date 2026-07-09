import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    const sessionUser = await getSession();

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ RBAC CHECK
    if (!can.isStaff(sessionUser)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, points } = body;

    if (!title || !points) {
      return NextResponse.json(
        { error: "Title and points are required" },
        { status: 400 },
      );
    }

    // const created = await prisma.servicePillar.create({
    //   // data: {
    //   //   title,
    //   //   points: Number(points),
    //   // },
    // });

    return NextResponse.json(
      { error: "Feature not implemented" },
      { status: 501 },
    );
  } catch (error: any) {
    console.error("[CREATE_PILLAR_ERROR]", error);

    return NextResponse.json(
      { error: error.message || "Failed to create pillar" },
      { status: 500 },
    );
  }
}
