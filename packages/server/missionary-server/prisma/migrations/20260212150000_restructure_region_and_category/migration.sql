-- Step 1: Remove FK constraint from missionary.region_id → old missionary_region
ALTER TABLE "missionary" DROP CONSTRAINT IF EXISTS "missionary_region_id_fkey";

-- Step 2: Drop region_id column from missionary
ALTER TABLE "missionary" DROP COLUMN IF EXISTS "region_id";

-- Step 3: Drop old missionary_region table (국내/해외 - replaced by MissionaryCategory enum)
DROP TABLE IF EXISTS "missionary_region";

-- Step 4: Rename missionary_church → missionary_region (연계지)
-- First drop the FK to avoid issues during rename
ALTER TABLE "missionary_church" DROP CONSTRAINT IF EXISTS "missionary_church_missionary_id_fkey";
ALTER TABLE "missionary_church" RENAME TO "missionary_region";

-- Step 5: Re-add FK constraint with new table name
ALTER TABLE "missionary_region" ADD CONSTRAINT "missionary_region_missionary_id_fkey"
  FOREIGN KEY ("missionary_id") REFERENCES "missionary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
