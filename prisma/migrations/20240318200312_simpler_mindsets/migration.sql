/*
  Warnings:

  - You are about to drop the column `mindset` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the `mindsetRels` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "mindsetRels" DROP CONSTRAINT "mindsetRels_fromMindsetId_fkey";

-- DropForeignKey
ALTER TABLE "mindsetRels" DROP CONSTRAINT "mindsetRels_toMindsetId_fkey";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "mindset",
ADD COLUMN     "mindsetId" TEXT NOT NULL DEFAULT '0';

-- DropTable
DROP TABLE "mindsetRels";

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_mindsetId_fkey" FOREIGN KEY ("mindsetId") REFERENCES "mindsets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
