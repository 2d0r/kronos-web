-- CreateEnum
CREATE TYPE "Status" AS ENUM ('toDo', 'inProgress', 'done');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('veryHigh', 'high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "TimeSpan" AS ENUM ('day', 'week', 'month', 'year');

-- CreateEnum
CREATE TYPE "TimeOfDay" AS ENUM ('morning', 'noon', 'afternoon', 'evening', 'night');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('step', 'task', 'project', 'goal');

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priority" "Priority" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "duration" TIMESTAMP(3) NOT NULL,
    "mindsetId" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "repeat" BOOLEAN NOT NULL,
    "frequency" INTEGER NOT NULL,
    "repeatRange" "TimeSpan" NOT NULL,
    "totalDuration" TIMESTAMP(3) NOT NULL,
    "preferredTimeOfDay" "TimeOfDay"[],
    "preferredDayOfWeek" "DayOfWeek"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mindsets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "mindsets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TaskChain" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TaskCausality" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "tasks_name_idx" ON "tasks"("name");

-- CreateIndex
CREATE UNIQUE INDEX "mindsets_name_key" ON "mindsets"("name");

-- CreateIndex
CREATE INDEX "mindsets_name_idx" ON "mindsets"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_TaskChain_AB_unique" ON "_TaskChain"("A", "B");

-- CreateIndex
CREATE INDEX "_TaskChain_B_index" ON "_TaskChain"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TaskCausality_AB_unique" ON "_TaskCausality"("A", "B");

-- CreateIndex
CREATE INDEX "_TaskCausality_B_index" ON "_TaskCausality"("B");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_mindsetId_fkey" FOREIGN KEY ("mindsetId") REFERENCES "mindsets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskChain" ADD CONSTRAINT "_TaskChain_A_fkey" FOREIGN KEY ("A") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskChain" ADD CONSTRAINT "_TaskChain_B_fkey" FOREIGN KEY ("B") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskCausality" ADD CONSTRAINT "_TaskCausality_A_fkey" FOREIGN KEY ("A") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskCausality" ADD CONSTRAINT "_TaskCausality_B_fkey" FOREIGN KEY ("B") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
