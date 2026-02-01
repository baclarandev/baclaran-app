/*
  Warnings:

  - You are about to drop the column `allowPreRegistration` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `preRegistrationDeadline` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "allowPreRegistration",
DROP COLUMN "name",
DROP COLUMN "preRegistrationDeadline";
