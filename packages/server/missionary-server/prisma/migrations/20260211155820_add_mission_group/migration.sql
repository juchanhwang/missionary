-- CreateTable
CREATE TABLE "mission_group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "MissionaryRegionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "mission_group_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "missionary" ADD COLUMN "mission_group_id" TEXT,
ADD COLUMN "order" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "missionary_mission_group_id_order_key" ON "missionary"("mission_group_id", "order");

-- AddForeignKey
ALTER TABLE "missionary" ADD CONSTRAINT "missionary_mission_group_id_fkey" FOREIGN KEY ("mission_group_id") REFERENCES "mission_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
