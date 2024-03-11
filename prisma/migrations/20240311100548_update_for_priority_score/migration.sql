/*
  Warnings:

  - You are about to drop the column `repetitions` on the `tasks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "repetitions",
ADD COLUMN     "repetitionsDone" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scheduled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalRepetitions" INTEGER;
