-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_IN', 'ABSENT');

-- CreateTable
CREATE TABLE "Mass" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "slots" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MassBooking" (
    "id" SERIAL NOT NULL,
    "massId" INTEGER NOT NULL,
    "volunteerId" INTEGER NOT NULL,
    "ministryId" INTEGER NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PENDING',
    "servedAt" TIMESTAMP(3),
    "qrToken" TEXT,
    "confirmedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MassBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MassBooking_qrToken_key" ON "MassBooking"("qrToken");

-- AddForeignKey
ALTER TABLE "MassBooking" ADD CONSTRAINT "MassBooking_massId_fkey" FOREIGN KEY ("massId") REFERENCES "Mass"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MassBooking" ADD CONSTRAINT "MassBooking_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MassBooking" ADD CONSTRAINT "MassBooking_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
