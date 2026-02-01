/*
  Warnings:

  - Added the required column `qrOpenAt` to the `Mass` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mass" ADD COLUMN     "qrOpenAt" TIMESTAMP(3) NOT NULL;
