-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CHAIRMAN', 'ADMIN', 'VOLUNTEER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VOLUNTEER',
    "ministryId" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Volunteer" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "volunteer_status" TEXT,
    "profile_picture" TEXT,

    CONSTRAINT "Volunteer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerDetail" (
    "id" SERIAL NOT NULL,
    "volunteer_id" INTEGER NOT NULL,
    "ministry_id" INTEGER NOT NULL,
    "line_group" TEXT,
    "applied_month_year" TEXT,
    "regular_years_month" TEXT,

    CONSTRAINT "VolunteerDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerSacrament" (
    "id" SERIAL NOT NULL,
    "volunteer_id" INTEGER NOT NULL,
    "sacrament_name" TEXT NOT NULL,

    CONSTRAINT "VolunteerSacrament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerFormation" (
    "id" SERIAL NOT NULL,
    "volunteer_id" INTEGER NOT NULL,
    "formation_name" TEXT NOT NULL,
    "year" INTEGER,

    CONSTRAINT "VolunteerFormation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerTimeline" (
    "id" SERIAL NOT NULL,
    "volunteer_id" INTEGER NOT NULL,
    "organization_name" TEXT NOT NULL,
    "year_started" INTEGER NOT NULL,
    "year_ended" INTEGER,
    "total_years" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VolunteerTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerAttendance" (
    "id" SERIAL NOT NULL,
    "volunteer_id" INTEGER NOT NULL,
    "ministry_id" INTEGER NOT NULL,
    "total_service_hours" INTEGER,
    "meeting_attendance_count" INTEGER,
    "absent_count" INTEGER,
    "remarks" TEXT,

    CONSTRAINT "VolunteerAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ministry" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parent_id" INTEGER,

    CONSTRAINT "Ministry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventVolunteer" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "volunteer_id" INTEGER NOT NULL,

    CONSTRAINT "EventVolunteer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAttendance" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "volunteer_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "EventAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerDetail_volunteer_id_key" ON "VolunteerDetail"("volunteer_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerDetail" ADD CONSTRAINT "VolunteerDetail_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerDetail" ADD CONSTRAINT "VolunteerDetail_ministry_id_fkey" FOREIGN KEY ("ministry_id") REFERENCES "Ministry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerSacrament" ADD CONSTRAINT "VolunteerSacrament_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerFormation" ADD CONSTRAINT "VolunteerFormation_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerTimeline" ADD CONSTRAINT "VolunteerTimeline_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerAttendance" ADD CONSTRAINT "VolunteerAttendance_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerAttendance" ADD CONSTRAINT "VolunteerAttendance_ministry_id_fkey" FOREIGN KEY ("ministry_id") REFERENCES "Ministry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ministry" ADD CONSTRAINT "Ministry_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Ministry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVolunteer" ADD CONSTRAINT "EventVolunteer_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVolunteer" ADD CONSTRAINT "EventVolunteer_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendance" ADD CONSTRAINT "EventAttendance_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAttendance" ADD CONSTRAINT "EventAttendance_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
