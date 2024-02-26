/*
  Warnings:

  - You are about to drop the column `frequency` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `repeatRange` on the `tasks` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MindsetEnum" AS ENUM ('survive', 'maintain', 'socialise', 'play', 'learn', 'selfCare', 'create', 'selfChallenge', 'restReward');

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "frequency",
DROP COLUMN "repeatRange",
ADD COLUMN     "repeatDuration" INTEGER,
ADD COLUMN     "repeatFrequency" INTEGER,
ADD COLUMN     "repeatTimespan" "TimeSpan";
