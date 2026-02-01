-- CreateEnum
CREATE TYPE "MinistryType" AS ENUM ('LITURGICAL', 'PASTORAL');

-- AlterTable
ALTER TABLE "Ministry" ADD COLUMN     "type" "MinistryType";
