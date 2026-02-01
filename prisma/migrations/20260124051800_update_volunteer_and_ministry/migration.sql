/*
  Warnings:

  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventAttendance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventVolunteer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventAttendance" DROP CONSTRAINT "EventAttendance_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventAttendance" DROP CONSTRAINT "EventAttendance_volunteerId_fkey";

-- DropForeignKey
ALTER TABLE "EventVolunteer" DROP CONSTRAINT "EventVolunteer_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventVolunteer" DROP CONSTRAINT "EventVolunteer_volunteerId_fkey";

-- DropTable
DROP TABLE "Event";

-- DropTable
DROP TABLE "EventAttendance";

-- DropTable
DROP TABLE "EventVolunteer";
