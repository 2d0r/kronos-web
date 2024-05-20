/*
  Warnings:

  - The values [noon] on the enum `TimeOfDay` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TimeOfDay_new" AS ENUM ('morning', 'afternoon', 'evening', 'night');
ALTER TABLE "tasks" ALTER COLUMN "preferredTimeOfDay" TYPE "TimeOfDay_new"[] USING ("preferredTimeOfDay"::text::"TimeOfDay_new"[]);
ALTER TYPE "TimeOfDay" RENAME TO "TimeOfDay_old";
ALTER TYPE "TimeOfDay_new" RENAME TO "TimeOfDay";
DROP TYPE "TimeOfDay_old";
COMMIT;
