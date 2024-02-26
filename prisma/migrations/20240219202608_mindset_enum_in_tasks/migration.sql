/*
  Warnings:

  - You are about to drop the column `mindsetId` on the `tasks` table. All the data in the column will be lost.
  - Added the required column `mindset` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_mindsetId_fkey";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "mindsetId",
ADD COLUMN     "mindset" "MindsetEnum" NOT NULL;
