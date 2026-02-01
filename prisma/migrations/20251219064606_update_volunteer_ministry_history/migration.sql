/*
  Warnings:

  - You are about to drop the column `ministryId` on the `VolunteerDetail` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Ministry` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "VolunteerDetail" DROP CONSTRAINT "VolunteerDetail_ministryId_fkey";

-- AlterTable
ALTER TABLE "VolunteerDetail" DROP COLUMN "ministryId";

-- CreateTable
CREATE TABLE "VolunteerMinistryHistory" (
    "id" SERIAL NOT NULL,
    "volunteerId" INTEGER NOT NULL,
    "ministryId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "VolunteerMinistryHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ministry_name_key" ON "Ministry"("name");

-- AddForeignKey
ALTER TABLE "VolunteerMinistryHistory" ADD CONSTRAINT "VolunteerMinistryHistory_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerMinistryHistory" ADD CONSTRAINT "VolunteerMinistryHistory_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
