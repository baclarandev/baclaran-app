/*
  Warnings:

  - You are about to drop the column `parentId` on the `Ministry` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `VolunteerMinistryHistory` table. All the data in the column will be lost.
  - You are about to drop the column `isCurrent` on the `VolunteerMinistryHistory` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `VolunteerMinistryHistory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Ministry" DROP CONSTRAINT "Ministry_parentId_fkey";

-- AlterTable
ALTER TABLE "Ministry" DROP COLUMN "parentId";

-- AlterTable
ALTER TABLE "VolunteerMinistryHistory" DROP COLUMN "endDate",
DROP COLUMN "isCurrent",
DROP COLUMN "startDate",
ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "leftAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "VolunteerMinistryHistory_volunteerId_idx" ON "VolunteerMinistryHistory"("volunteerId");
