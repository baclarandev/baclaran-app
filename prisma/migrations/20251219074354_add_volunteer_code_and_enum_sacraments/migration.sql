/*
  Warnings:

  - You are about to drop the `VolunteerSacrament` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SacramentName" AS ENUM ('BAPTISM', 'CONFIRMATION', 'EUCHARIST', 'RECONCILIATION', 'ANOINTING_OF_THE_SICK', 'HOLY_ORDERS', 'MATRIMONY');

-- DropForeignKey
ALTER TABLE "VolunteerSacrament" DROP CONSTRAINT "VolunteerSacrament_volunteerId_fkey";

-- AlterTable
ALTER TABLE "Volunteer" ADD COLUMN     "sacraments" "SacramentName"[];

-- DropTable
DROP TABLE "VolunteerSacrament";
