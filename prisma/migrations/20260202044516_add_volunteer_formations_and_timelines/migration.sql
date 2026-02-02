-- CreateTable
CREATE TABLE "VolunteerFormation" (
    "id" SERIAL NOT NULL,
    "volunteerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "VolunteerFormation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerTimeline" (
    "id" SERIAL NOT NULL,
    "volunteerId" INTEGER NOT NULL,
    "organization" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "totalYears" INTEGER NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "VolunteerTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VolunteerFormation_volunteerId_idx" ON "VolunteerFormation"("volunteerId");

-- CreateIndex
CREATE INDEX "VolunteerTimeline_volunteerId_idx" ON "VolunteerTimeline"("volunteerId");

-- AddForeignKey
ALTER TABLE "VolunteerFormation" ADD CONSTRAINT "VolunteerFormation_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerTimeline" ADD CONSTRAINT "VolunteerTimeline_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
