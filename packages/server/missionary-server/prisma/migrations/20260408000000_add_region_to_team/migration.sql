-- AlterTable
ALTER TABLE "team" ADD COLUMN     "missionary_region_id" TEXT;

-- CreateIndex
CREATE INDEX "team_missionary_region_id_idx" ON "team"("missionary_region_id");

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_missionary_region_id_fkey" FOREIGN KEY ("missionary_region_id") REFERENCES "missionary_region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
