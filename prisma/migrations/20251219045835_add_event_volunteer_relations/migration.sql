/*
  Warnings:

  - You are about to drop the column `event_id` on the `EventAttendance` table. All the data in the column will be lost.
  - You are about to drop the column `volunteer_id` on the `EventAttendance` table. All the data in the column will be lost.
  - You are about to drop the column `event_id` on the `EventVolunteer` table. All the data in the column will be lost.
  - You are about to drop the column `volunteer_id` on the `EventVolunteer` table. All the data in the column will be lost.
  - You are about to drop the column `parent_id` on the `Ministry` table. All the data in the column will be lost.
  - You are about to drop the column `full_name` on the `Volunteer` table. All the data in the column will be lost.
  - You are about to drop the column `profile_picture` on the `Volunteer` table. All the data in the column will be lost.
  - You are about to drop the column `volunteer_status` on the `Volunteer` table. All the data in the column will be lost.
  - You are about to drop the column `absent_count` on the `VolunteerAttendance` table. All the data in the column will be lost.
  - You are about to drop the column `meeting_attendance_count` on the `VolunteerAttendance` table. All the data in the column will be lost.
  - You are about to drop the column `ministry_id` on the `VolunteerAttendance` table. All the data in the column will be lost.
  - You are about to drop the column `total_service_hours` on the `VolunteerAttendance` table. All the data in the column will be lost.
  - You are about to drop the column `volunteer_id` on the `VolunteerAttendance` table. All the data in the column will be lost.
  - You are about to drop the column `applied_month_year` on the `VolunteerDetail` table. All the data in the column will be lost.
  - You are about to drop the column `line_group` on the `VolunteerDetail` table. All the data in the column will be lost.
  - You are about to drop the column `ministry_id` on the `VolunteerDetail` table. All the data in the column will be lost.
  - You are about to drop the column `regular_years_month` on the `VolunteerDetail` table. All the data in the column will be lost.
  - You are about to drop the column `volunteer_id` on the `VolunteerDetail` table. All the data in the column will be lost.
  - You are about to drop the column `formation_name` on the `VolunteerFormation` table. All the data in the column will be lost.
  - You are about to drop the column `volunteer_id` on the `VolunteerFormation` table. All the data in the column will be lost.
  - You are about to drop the column `sacrament_name` on the `VolunteerSacrament` table. All the data in the column will be lost.
  - You are about to drop the column `volunteer_id` on the `VolunteerSacrament` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `VolunteerTimeline` table. All the data in the column will be lost.
  - You are about to drop the column `organization_name` on the `VolunteerTimeline` table. All the data in the column will be lost.
  - You are about to drop the column `total_years` on the `VolunteerTimeline` table. All the data in the column will be lost.
  - You are about to drop the column `volunteer_id` on the `VolunteerTimeline` table. All the data in the column will be lost.
  - You are about to drop the column `year_ended` on the `VolunteerTimeline` table. All the data in the column will be lost.
  - You are about to drop the column `year_started` on the `VolunteerTimeline` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[volunteerCode]` on the table `Volunteer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Volunteer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[volunteerId]` on the table `VolunteerDetail` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventId` to the `EventAttendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volunteerId` to the `EventAttendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventId` to the `EventVolunteer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volunteerId` to the `EventVolunteer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `civilStatus` to the `Volunteer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Volunteer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Volunteer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Volunteer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sex` to the `Volunteer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Volunteer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volunteerCode` to the `Volunteer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ministryId` to the `VolunteerAttendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volunteerId` to the `VolunteerAttendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ministryId` to the `VolunteerDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volunteerId` to the `VolunteerDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `VolunteerFormation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volunteerId` to the `VolunteerFormation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `VolunteerSacrament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volunteerId` to the `VolunteerSacrament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization` to the `VolunteerTimeline` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volunteerId` to the `VolunteerTimeline` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearStarted` to the `VolunteerTimeline` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'STAFF';

-- DropForeignKey
ALTER TABLE "EventAttendance" DROP CONSTRAINT "EventAttendance_event_id_fkey";

-- DropForeignKey
ALTER TABLE "EventAttendance" DROP CONSTRAINT "EventAttendance_volunteer_id_fkey";

-- DropForeignKey
ALTER TABLE "EventVolunteer" DROP CONSTRAINT "EventVolunteer_event_id_fkey";

-- DropForeignKey
ALTER TABLE "EventVolunteer" DROP CONSTRAINT "EventVolunteer_volunteer_id_fkey";

-- DropForeignKey
ALTER TABLE "Ministry" DROP CONSTRAINT "Ministry_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "VolunteerAttendance" DROP CONSTRAINT "VolunteerAttendance_ministry_id_fkey";

-- DropForeignKey
ALTER TABLE "VolunteerAttendance" DROP CONSTRAINT "VolunteerAttendance_volunteer_id_fkey";

-- DropForeignKey
ALTER TABLE "VolunteerDetail" DROP CONSTRAINT "VolunteerDetail_ministry_id_fkey";

-- DropForeignKey
ALTER TABLE "VolunteerDetail" DROP CONSTRAINT "VolunteerDetail_volunteer_id_fkey";

-- DropForeignKey
ALTER TABLE "VolunteerFormation" DROP CONSTRAINT "VolunteerFormation_volunteer_id_fkey";

-- DropForeignKey
ALTER TABLE "VolunteerSacrament" DROP CONSTRAINT "VolunteerSacrament_volunteer_id_fkey";

-- DropForeignKey
ALTER TABLE "VolunteerTimeline" DROP CONSTRAINT "VolunteerTimeline_volunteer_id_fkey";

-- DropIndex
DROP INDEX "VolunteerDetail_volunteer_id_key";

-- AlterTable
ALTER TABLE "EventAttendance" DROP COLUMN "event_id",
DROP COLUMN "volunteer_id",
ADD COLUMN     "eventId" INTEGER NOT NULL,
ADD COLUMN     "volunteerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "EventVolunteer" DROP COLUMN "event_id",
DROP COLUMN "volunteer_id",
ADD COLUMN     "eventId" INTEGER NOT NULL,
ADD COLUMN     "volunteerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Ministry" DROP COLUMN "parent_id",
ADD COLUMN     "parentId" INTEGER;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Volunteer" DROP COLUMN "full_name",
DROP COLUMN "profile_picture",
DROP COLUMN "volunteer_status",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "civilStatus" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "middleInitial" TEXT,
ADD COLUMN     "nickname" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profilePicture" TEXT,
ADD COLUMN     "sex" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "volunteerCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VolunteerAttendance" DROP COLUMN "absent_count",
DROP COLUMN "meeting_attendance_count",
DROP COLUMN "ministry_id",
DROP COLUMN "total_service_hours",
DROP COLUMN "volunteer_id",
ADD COLUMN     "absences" INTEGER,
ADD COLUMN     "meetings" INTEGER,
ADD COLUMN     "ministryId" INTEGER NOT NULL,
ADD COLUMN     "serviceHours" INTEGER,
ADD COLUMN     "volunteerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "VolunteerDetail" DROP COLUMN "applied_month_year",
DROP COLUMN "line_group",
DROP COLUMN "ministry_id",
DROP COLUMN "regular_years_month",
DROP COLUMN "volunteer_id",
ADD COLUMN     "appliedAt" TEXT,
ADD COLUMN     "lineGroup" TEXT,
ADD COLUMN     "ministryId" INTEGER NOT NULL,
ADD COLUMN     "regularFor" TEXT,
ADD COLUMN     "volunteerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "VolunteerFormation" DROP COLUMN "formation_name",
DROP COLUMN "volunteer_id",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "volunteerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "VolunteerSacrament" DROP COLUMN "sacrament_name",
DROP COLUMN "volunteer_id",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "volunteerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "VolunteerTimeline" DROP COLUMN "is_active",
DROP COLUMN "organization_name",
DROP COLUMN "total_years",
DROP COLUMN "volunteer_id",
DROP COLUMN "year_ended",
DROP COLUMN "year_started",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "organization" TEXT NOT NULL,
ADD COLUMN     "volunteerId" INTEGER NOT NULL,
ADD COLUMN     "yearEnded" INTEGER,
ADD COLUMN     "yearStarted" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Volunteer_volunteerCode_key" ON "Volunteer"("volunteerCode");

-- CreateIndex
CREATE UNIQUE INDEX "Volunteer_email_key" ON "Volunteer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerDetail_volunteerId_key" ON "VolunteerDetail"("volunteerId");

-- AddForeignKey
ALTER TABLE "VolunteerDetail" ADD CONSTRAINT "VolunteerDetail_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerDetail" ADD CONSTRAINT "VolunteerDetail_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerSacrament" ADD CONSTRAINT "VolunteerSacrament_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerFormation" ADD CONSTRAINT "VolunteerFormation_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerTimeline" ADD CONSTRAINT "VolunteerTimeline_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerAttendance" ADD CONSTRAINT "VolunteerAttendance_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerAttendance" ADD CONSTRAINT "VolunteerAttendance_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ministry" ADD CONSTRAINT "Ministry_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Ministry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVolunteer" ADD CONSTRAINT "EventVolunteer_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVolunteer" ADD CONSTRAINT "EventVolunteer_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendance" ADD CONSTRAINT "EventAttendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendance" ADD CONSTRAINT "EventAttendance_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
