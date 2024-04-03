/*
  Warnings:

  - Made the column `repeatTimespanMultiplier` on table `tasks` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "repeatTimespanMultiplier" SET NOT NULL,
ALTER COLUMN "repeatTimespanMultiplier" SET DEFAULT 1;
