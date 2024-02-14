/*
  Warnings:

  - Added the required column `create` to the `mindsets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `learn` to the `mindsets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maintain` to the `mindsets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `play` to the `mindsets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restReward` to the `mindsets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selfCare` to the `mindsets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selfChallenge` to the `mindsets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `socialise` to the `mindsets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `survive` to the `mindsets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "mindsets" ADD COLUMN     "create" INTEGER NOT NULL,
ADD COLUMN     "learn" INTEGER NOT NULL,
ADD COLUMN     "maintain" INTEGER NOT NULL,
ADD COLUMN     "play" INTEGER NOT NULL,
ADD COLUMN     "restReward" INTEGER NOT NULL,
ADD COLUMN     "selfCare" INTEGER NOT NULL,
ADD COLUMN     "selfChallenge" INTEGER NOT NULL,
ADD COLUMN     "socialise" INTEGER NOT NULL,
ADD COLUMN     "survive" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "notes" TEXT,
ALTER COLUMN "startTime" DROP NOT NULL,
ALTER COLUMN "endTime" DROP NOT NULL,
ALTER COLUMN "duration" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'toDo',
ALTER COLUMN "repeat" SET DEFAULT false,
ALTER COLUMN "frequency" DROP NOT NULL,
ALTER COLUMN "repeatRange" DROP NOT NULL,
ALTER COLUMN "totalDuration" DROP NOT NULL;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_name_idx" ON "users"("name");
