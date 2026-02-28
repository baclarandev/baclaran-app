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
  /* ================= GET MINISTRY ================= */

  const ministry = await prisma.ministry.findUnique({
    where: { id: rootMinistryId },
    select: { name: true },
  });

  if (!ministry) {
    throw new Error("Ministry not found");
  }

  const joinedYear = year ?? new Date().getFullYear();
  const initials = getMinistryInitials(ministry.name);

  /* ================= FIND LAST SEQUENCE ================= */
  // IMPORTANT:
  // No year filtering anymore

  const lastVolunteer = await prisma.volunteer.findFirst({
    where: {
      ministryHistories: {
        some: {
          ministry: {
            OR: [
              { id: rootMinistryId },
              { parentId: rootMinistryId }, // include sub ministries
            ],
          },
        },
      },
    },
    orderBy: {
      volunteerCode: "desc", // highest sequence first
    },
    select: {
      volunteerCode: true,
    },
  });

  /* ================= COMPUTE NEXT NUMBER ================= */

  let nextNumber = 1;

  if (lastVolunteer?.volunteerCode) {
    const parts = lastVolunteer.volunteerCode.split("-");
    const lastSeq = Number(parts[2]);

    if (!isNaN(lastSeq)) {
      nextNumber = lastSeq + 1;
    }
  }

  const volunteerCode = `${initials}-${joinedYear}-${String(nextNumber).padStart(4, "0")}`;

  return {
    volunteerCode,
    joinedYear,
  };
}
