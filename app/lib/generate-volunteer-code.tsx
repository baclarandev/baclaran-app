import { prisma } from "@/lib/prisma";

/**
 * Generate next volunteer code
 *
 * FORMAT:
 * MINISTRYCODE-JOINEDYEARSHRINE-0001
 *
 * RULES:
 * - sequence never resets
 * - sequence separated per ministry or sub-ministry
 */
export async function generateVolunteerCode(
  ministryId: number, // could be parent or sub-ministry
  joinedYearShrine?: number,
) {
  // ✅ get ministry + code
  const ministry = await prisma.ministry.findUnique({
    where: { id: ministryId },
    select: {
      ministryCode: true,
      parentId: true,
    },
  });

  if (!ministry) throw new Error("Ministry not found");

  // if ministry code missing, fallback to parent ministry code
  let ministryCode = ministry.ministryCode;

  if (!ministryCode) {
    if (!ministry.parentId) {
      throw new Error("Ministry code not configured");
    }
    const parent = await prisma.ministry.findUnique({
      where: { id: ministry.parentId },
      select: { ministryCode: true },
    });
    if (!parent?.ministryCode)
      throw new Error("Parent ministry code not configured");
    ministryCode = parent.ministryCode;
  }

  const year = joinedYearShrine ?? new Date().getFullYear();

  // --- Get all volunteers under this ministry/sub-ministry ---
  const volunteers = await prisma.volunteer.findMany({
    where: {
      ministryHistories: {
        some: { ministryId }, // only this ministry
      },
    },
    select: { volunteerCode: true },
  });

  // --- Compute next sequence ---
  let nextNumber = 1;
  if (volunteers.length) {
    const sequences = volunteers
      .map((v) => {
        const parts = v.volunteerCode.split("-");
        return Number(parts[parts.length - 1]) || 0;
      })
      .filter((n) => n > 0);

    if (sequences.length) nextNumber = Math.max(...sequences) + 1;
  }

  const volunteerCode = `${ministryCode}-${year}-${String(nextNumber).padStart(
    4,
    "0",
  )}`;

  return { volunteerCode, joinedYear: year };
}
