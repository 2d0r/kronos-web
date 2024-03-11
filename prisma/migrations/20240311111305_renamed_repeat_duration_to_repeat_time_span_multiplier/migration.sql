/*
  Warnings:

  - You are about to drop the column `repeatDuration` on the `tasks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "repeatDuration",
ADD COLUMN     "repeatTimespanMultiplier" INTEGER;
