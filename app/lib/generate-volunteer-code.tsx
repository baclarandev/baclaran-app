import { prisma } from "@/lib/prisma";

/**
 * Words ignored when generating initials
 */
const STOP_WORDS = ["of", "and", "the", "ng", "sa", "ni", "de"];

/**
 * Convert ministry name → initials
 * Example:
 * "Ministry of Altar Servers" -> AS
 * "Sacred Heart Choir" -> SHC
 */
export function getMinistryInitials(name: string): string {
  return name
    .split(" ")
    .filter(
      (word) => word.trim() !== "" && !STOP_WORDS.includes(word.toLowerCase()),
    )
    .map((word) => word[0].toUpperCase())
    .join("")
    .slice(0, 3);
}

/**
 * Generate next volunteer code
 * FORMAT:
 * INITIALS-YEAR-0001
 *
 * RULES:
 * - sequence NEVER resets per year
 * - sequence separated per ROOT ministry
 */
export async function generateVolunteerCode(
  rootMinistryId: number,
  year?: number,
) {
  const ministry = await prisma.ministry.findUnique({
    where: { id: rootMinistryId },
    select: { name: true },
  });

  if (!ministry) throw new Error("Ministry not found");

  const joinedYear = year ?? new Date().getFullYear();
  const initials = getMinistryInitials(ministry.name);

  // --- Get all volunteers under this root ministry (including sub-ministries) ---
  const volunteers = await prisma.volunteer.findMany({
    where: {
      ministryHistories: {
        some: {
          ministry: {
            OR: [{ id: rootMinistryId }, { parentId: rootMinistryId }],
          },
        },
      },
    },
    select: { volunteerCode: true },
  });

  // --- Compute next sequence number numerically ---
  let nextNumber = 1;
  if (volunteers.length) {
    const sequences = volunteers.map((v) => {
      const parts = v.volunteerCode.split("-");
      return Number(parts[2]) || 0; // take the numeric sequence
    });
    nextNumber = Math.max(...sequences) + 1;
  }

  const volunteerCode = `${initials}-${joinedYear}-${String(nextNumber).padStart(4, "0")}`;
  return { volunteerCode, joinedYear };
}
