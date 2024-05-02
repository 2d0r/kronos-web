-- DropForeignKey
ALTER TABLE "breaks" DROP CONSTRAINT "breaks_eventId_fkey";

-- AlterTable
ALTER TABLE "breaks" ALTER COLUMN "eventId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "breaks" ADD CONSTRAINT "breaks_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
