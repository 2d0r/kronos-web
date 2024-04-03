-- CreateEnum
CREATE TYPE "RepeatUnit" AS ENUM ('sessions', 'minutes');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "repeatUnit" "RepeatUnit" NOT NULL DEFAULT 'sessions';
