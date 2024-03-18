/*
  Warnings:

  - You are about to drop the column `create` on the `mindsets` table. All the data in the column will be lost.
  - You are about to drop the column `learn` on the `mindsets` table. All the data in the column will be lost.
  - You are about to drop the column `maintain` on the `mindsets` table. All the data in the column will be lost.
  - You are about to drop the column `play` on the `mindsets` table. All the data in the column will be lost.
  - You are about to drop the column `restReward` on the `mindsets` table. All the data in the column will be lost.
  - You are about to drop the column `selfCare` on the `mindsets` table. All the data in the column will be lost.
  - You are about to drop the column `selfChallenge` on the `mindsets` table. All the data in the column will be lost.
  - You are about to drop the column `socialise` on the `mindsets` table. All the data in the column will be lost.
  - You are about to drop the column `survive` on the `mindsets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "mindsets" DROP COLUMN "create",
DROP COLUMN "learn",
DROP COLUMN "maintain",
DROP COLUMN "play",
DROP COLUMN "restReward",
DROP COLUMN "selfCare",
DROP COLUMN "selfChallenge",
DROP COLUMN "socialise",
DROP COLUMN "survive",
ADD COLUMN     "maslowLevel" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "mindsetRels" (
    "id" TEXT NOT NULL,
    "fromMindsetId" TEXT NOT NULL,
    "toMindsetId" TEXT NOT NULL,
    "proximity" INTEGER NOT NULL,

    CONSTRAINT "mindsetRels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mindsetRels_fromMindsetId_key" ON "mindsetRels"("fromMindsetId");

-- CreateIndex
CREATE UNIQUE INDEX "mindsetRels_toMindsetId_key" ON "mindsetRels"("toMindsetId");

-- CreateIndex
CREATE INDEX "mindsetRels_id_idx" ON "mindsetRels"("id");

-- AddForeignKey
ALTER TABLE "mindsetRels" ADD CONSTRAINT "mindsetRels_fromMindsetId_fkey" FOREIGN KEY ("fromMindsetId") REFERENCES "mindsets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mindsetRels" ADD CONSTRAINT "mindsetRels_toMindsetId_fkey" FOREIGN KEY ("toMindsetId") REFERENCES "mindsets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
