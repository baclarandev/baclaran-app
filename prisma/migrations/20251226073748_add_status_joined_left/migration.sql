/*
  Warnings:

  - You are about to drop the `VolunteerDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VolunteerFormation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VolunteerTimeline` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VolunteerDetail" DROP CONSTRAINT "VolunteerDetail_volunteerId_fkey";

-- DropForeignKey
ALTER TABLE "VolunteerFormation" DROP CONSTRAINT "VolunteerFormation_volunteerId_fkey";

-- DropForeignKey
ALTER TABLE "VolunteerTimeline" DROP CONSTRAINT "VolunteerTimeline_volunteerId_fkey";

-- AlterTable
ALTER TABLE "VolunteerAttendance" ADD COLUMN     "attendedAt" JSONB;

-- DropTable
DROP TABLE "VolunteerDetail";

-- DropTable
DROP TABLE "VolunteerFormation";

-- DropTable
DROP TABLE "VolunteerTimeline";
