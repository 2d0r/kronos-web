-- AlterEnum
ALTER TYPE "TimeSpan" ADD VALUE 'hour';

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "completion" INTEGER DEFAULT 0,
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "firstSessionStartTime" TIMESTAMP(3),
ADD COLUMN     "latestSessionStartTime" TIMESTAMP(3),
ADD COLUMN     "priorityScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "timeSpent" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "averageSleep" INTEGER;
