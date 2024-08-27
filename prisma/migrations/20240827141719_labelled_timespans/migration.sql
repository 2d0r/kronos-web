/*
  Warnings:

  - You are about to drop the `Timespan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Timespan";

-- CreateTable
CREATE TABLE "timespans" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "type" "TimespanType" NOT NULL DEFAULT 'organised',

    CONSTRAINT "timespans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "timespans_id_idx" ON "timespans"("id");
