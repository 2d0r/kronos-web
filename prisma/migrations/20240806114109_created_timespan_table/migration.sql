-- CreateEnum
CREATE TYPE "TimespanType" AS ENUM ('organised', 'holiday');

-- CreateTable
CREATE TABLE "Timespan" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "type" "TimespanType" NOT NULL DEFAULT 'organised',

    CONSTRAINT "Timespan_pkey" PRIMARY KEY ("id")
);
