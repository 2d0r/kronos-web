-- AlterTable
ALTER TABLE "events" ADD COLUMN "fixed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tasks" RENAME COLUMN "scheduled" TO "fixed";
