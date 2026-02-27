import { prisma } from "@/lib/prisma";

/**
 * Finds the TOP LEVEL ministry (parentId === null)
 * Used for volunteer code grouping.
 */
export async function getRootMinistryId(ministryId: number): Promise<number> {
  let current = await prisma.ministry.findUnique({
    where: { id: ministryId },
    select: { id: true, parentId: true },
  });

  if (!current) {
    throw new Error("Ministry not found");
  }

  // climb hierarchy until root
  while (current.parentId !== null) {
    current = await prisma.ministry.findUnique({
      where: { id: current.parentId },
      select: { id: true, parentId: true },
    });

    if (!current) {
      throw new Error("Parent ministry missing");
    }
  }

  return current.id;
}
