-- DropForeignKey
ALTER TABLE "missionary" DROP CONSTRAINT "missionary_region_id_fkey";

-- AlterTable
ALTER TABLE "missionary" ALTER COLUMN "region_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "terms" ALTER COLUMN "seq" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "missionary" ADD CONSTRAINT "missionary_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "missionary_region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
