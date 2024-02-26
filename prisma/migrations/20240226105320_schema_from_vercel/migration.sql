/*
  Warnings:

  - The primary key for the `mindsets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `tasks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `mindsetId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `statusId` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `tasks` table. All the data in the column will be lost.
  - The `status` column on the `tasks` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `knex_migrations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `knex_migrations_lock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `statuses` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `mindsets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `create` to the `mindsets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `learn` to the `mindsets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maintain` to the `mindsets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `play` to the `mindsets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restReward` to the `mindsets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selfCare` to the `mindsets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selfChallenge` to the `mindsets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `socialise` to the `mindsets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `survive` to the `mindsets` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `mindsets` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `name` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdAt` on table `tasks` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `mindset` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MindsetEnum" AS ENUM ('survive', 'maintain', 'socialise', 'play', 'learn', 'selfCare', 'create', 'selfChallenge', 'restReward');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('toDo', 'inProgress', 'done');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('veryHigh', 'high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "TimeSpan" AS ENUM ('day', 'week', 'month', 'year');

-- CreateEnum
CREATE TYPE "TimeOfDay" AS ENUM ('morning', 'noon', 'afternoon', 'evening', 'night');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('step', 'task', 'project', 'goal');

-- DropIndex
DROP INDEX "tasks_createdat_index";

-- AlterTable
ALTER TABLE "mindsets" DROP CONSTRAINT "mindsets_pkey",
ADD COLUMN     "create" INTEGER NOT NULL,
ADD COLUMN     "learn" INTEGER NOT NULL,
ADD COLUMN     "maintain" INTEGER NOT NULL,
ADD COLUMN     "play" INTEGER NOT NULL,
ADD COLUMN     "restReward" INTEGER NOT NULL,
ADD COLUMN     "selfCare" INTEGER NOT NULL,
ADD COLUMN     "selfChallenge" INTEGER NOT NULL,
ADD COLUMN     "socialise" INTEGER NOT NULL,
ADD COLUMN     "survive" INTEGER NOT NULL,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ADD CONSTRAINT "mindsets_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_pkey",
DROP COLUMN "mindsetId",
DROP COLUMN "statusId",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "endRepeat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "endRepeatDate" TIMESTAMP(3),
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "preferredDayOfWeek" "DayOfWeek"[],
ADD COLUMN     "preferredTimeOfDay" "TimeOfDay"[],
ADD COLUMN     "priority" "Priority" NOT NULL,
ADD COLUMN     "repeat" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "repeatDuration" INTEGER,
ADD COLUMN     "repeatFrequency" INTEGER,
ADD COLUMN     "repeatTimespan" "TimeSpan",
ADD COLUMN     "repetitions" INTEGER,
ADD COLUMN     "startTime" TIMESTAMP(3),
ADD COLUMN     "totalDuration" INTEGER,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'toDo',
DROP COLUMN "mindset",
ADD COLUMN     "mindset" "MindsetEnum" NOT NULL,
ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "knex_migrations";

-- DropTable
DROP TABLE "knex_migrations_lock";

-- DropTable
DROP TABLE "statuses";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TaskCausality" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TaskChain" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_name_idx" ON "users"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_TaskCausality_AB_unique" ON "_TaskCausality"("A", "B");

-- CreateIndex
CREATE INDEX "_TaskCausality_B_index" ON "_TaskCausality"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TaskChain_AB_unique" ON "_TaskChain"("A", "B");

-- CreateIndex
CREATE INDEX "_TaskChain_B_index" ON "_TaskChain"("B");

-- CreateIndex
CREATE UNIQUE INDEX "mindsets_name_key" ON "mindsets"("name");

-- CreateIndex
CREATE INDEX "mindsets_name_idx" ON "mindsets"("name");

-- CreateIndex
CREATE INDEX "tasks_name_idx" ON "tasks"("name");

-- AddForeignKey
ALTER TABLE "_TaskCausality" ADD CONSTRAINT "_TaskCausality_A_fkey" FOREIGN KEY ("A") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskCausality" ADD CONSTRAINT "_TaskCausality_B_fkey" FOREIGN KEY ("B") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskChain" ADD CONSTRAINT "_TaskChain_A_fkey" FOREIGN KEY ("A") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskChain" ADD CONSTRAINT "_TaskChain_B_fkey" FOREIGN KEY ("B") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
