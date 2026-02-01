-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Volunteer" ADD COLUMN     "applicationStatus" "ApplicationStatus" NOT NULL DEFAULT 'PENDING';
