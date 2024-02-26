/*
  Warnings:

  - The `duration` column on the `tasks` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `totalDuration` column on the `tasks` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "duration",
ADD COLUMN     "duration" INTEGER,
DROP COLUMN "totalDuration",
ADD COLUMN     "totalDuration" INTEGER;
