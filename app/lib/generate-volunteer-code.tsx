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
    .slice(0, 3); // limit to 3 letters (optional but recommended)
}

/**
 * Generate next volunteer code
 * Format:
 * INITIALS-YEAR-0001
 */
export async function generateVolunteerCode(ministryId: number, year?: string) {
  const ministry = await prisma.ministry.findUnique({
    where: { id: ministryId },
    select: { name: true },
  });

  if (!ministry) {
    throw new Error("Ministry not found");
  }

  const joinedYear = year || new Date().getFullYear().toString(); // use selected year if provided
  const initials = getMinistryInitials(ministry.name);

  const lastVolunteer = await prisma.volunteer.findFirst({
    where: {
      joinedYear,
      ministryHistories: { some: { ministryId } },
    },
    orderBy: { id: "desc" },
    select: { volunteerCode: true },
  });

  let nextNumber = 1;

  if (lastVolunteer?.volunteerCode) {
    const parts = lastVolunteer.volunteerCode.split("-");
    const lastSeq = Number(parts[2]);
    if (!isNaN(lastSeq)) nextNumber = lastSeq + 1;
  }

  const volunteerCode = `${initials}-${joinedYear}-${String(nextNumber).padStart(4, "0")}`;

  return { volunteerCode, joinedYear };
}
