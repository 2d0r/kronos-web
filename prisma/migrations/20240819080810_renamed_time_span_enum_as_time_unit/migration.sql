/*
  Warnings:

  - You are about to drop the column `checklist` on the `tasks` table. All the data in the column will be lost.
  - The `repeatTimespan` column on the `tasks` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TimeUnit" AS ENUM ('hour', 'day', 'week', 'month', 'year');

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "checklist",
DROP COLUMN "repeatTimespan",
ADD COLUMN     "repeatTimespan" "TimeUnit";

-- DropEnum
DROP TYPE "TimeSpan";
