/*
  Warnings:

  - The primary key for the `mindsets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `create` on the `mindsets` table. All the data in the column will be lost.
  - You are about to drop the column `learn` on the `mindsets` table. All the data in the column will be lost.
  - You are about to drop the column `maintain` on the `mindsets` table. All the data in the column will be lost.
  - You are about to drop the column `play` on the `mindsets` table. All the data in the column will be lost.
  - You are about to drop the column `restReward` on the `mindsets` table. All the data in the column will be lost.
  - You are about to drop the column `selfCare` on the `mindsets` table. All the data in the column will be lost.
  - You are about to drop the column `selfChallenge` on the `mindsets` table. All the data in the column will be lost.
  - You are about to drop the column `socialise` on the `mindsets` table. All the data in the column will be lost.
  - You are about to drop the column `survive` on the `mindsets` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `mindsets` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(25)`.
  - You are about to alter the column `name` on the `mindsets` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The primary key for the `tasks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `duration` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `preferredDayOfWeek` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `preferredTimeOfDay` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `repeat` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `repeatDuration` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `repeatFrequency` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `repeatTimespan` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `totalDuration` on the `tasks` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `tasks` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(25)`.
  - The `status` column on the `tasks` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `mindset` column on the `tasks` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `_TaskCausality` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TaskChain` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_TaskCausality" DROP CONSTRAINT "_TaskCausality_A_fkey";

-- DropForeignKey
ALTER TABLE "_TaskCausality" DROP CONSTRAINT "_TaskCausality_B_fkey";

-- DropForeignKey
ALTER TABLE "_TaskChain" DROP CONSTRAINT "_TaskChain_A_fkey";

-- DropForeignKey
ALTER TABLE "_TaskChain" DROP CONSTRAINT "_TaskChain_B_fkey";

-- DropIndex
DROP INDEX "mindsets_name_idx";

-- DropIndex
DROP INDEX "mindsets_name_key";

-- DropIndex
DROP INDEX "tasks_name_idx";

-- AlterTable
ALTER TABLE "mindsets" DROP CONSTRAINT "mindsets_pkey",
DROP COLUMN "create",
DROP COLUMN "learn",
DROP COLUMN "maintain",
DROP COLUMN "play",
DROP COLUMN "restReward",
DROP COLUMN "selfCare",
DROP COLUMN "selfChallenge",
DROP COLUMN "socialise",
DROP COLUMN "survive",
ALTER COLUMN "id" SET DATA TYPE VARCHAR(25),
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ADD CONSTRAINT "mindsets_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_pkey",
DROP COLUMN "duration",
DROP COLUMN "endTime",
DROP COLUMN "name",
DROP COLUMN "notes",
DROP COLUMN "preferredDayOfWeek",
DROP COLUMN "preferredTimeOfDay",
DROP COLUMN "priority",
DROP COLUMN "repeat",
DROP COLUMN "repeatDuration",
DROP COLUMN "repeatFrequency",
DROP COLUMN "repeatTimespan",
DROP COLUMN "startTime",
DROP COLUMN "totalDuration",
ADD COLUMN     "mindsetId" VARCHAR(255),
ADD COLUMN     "statusId" VARCHAR(255),
ADD COLUMN     "title" VARCHAR(255),
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "id" SET DATA TYPE VARCHAR(25),
DROP COLUMN "status",
ADD COLUMN     "status" VARCHAR(255),
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
DROP COLUMN "mindset",
ADD COLUMN     "mindset" VARCHAR(255),
ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "_TaskCausality";

-- DropTable
DROP TABLE "_TaskChain";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "DayOfWeek";

-- DropEnum
DROP TYPE "MindsetEnum";

-- DropEnum
DROP TYPE "Priority";

-- DropEnum
DROP TYPE "Status";

-- DropEnum
DROP TYPE "TaskType";

-- DropEnum
DROP TYPE "TimeOfDay";

-- DropEnum
DROP TYPE "TimeSpan";

-- CreateTable
CREATE TABLE "knex_migrations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "batch" INTEGER,
    "migration_time" TIMESTAMPTZ(6),

    CONSTRAINT "knex_migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knex_migrations_lock" (
    "index" SERIAL NOT NULL,
    "is_locked" INTEGER,

    CONSTRAINT "knex_migrations_lock_pkey" PRIMARY KEY ("index")
);

-- CreateTable
CREATE TABLE "statuses" (
    "id" VARCHAR(25) NOT NULL,
    "name" VARCHAR(255),

    CONSTRAINT "statuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_createdat_index" ON "tasks"("createdAt");
