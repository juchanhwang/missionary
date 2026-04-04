-- AlterTable
ALTER TABLE "missionary" ADD COLUMN "is_accepting_responses" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "missionary" ADD COLUMN "closed_message" TEXT;
