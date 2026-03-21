-- MissionaryRegion FK 변경: missionary_id → mission_group_id
-- 연계지를 차수(Missionary) 단위에서 선교 그룹(MissionGroup) 단위로 전환

-- 1. 사전 검증: mission_group_id가 NULL인 차수에 속한 연계지가 있으면 마이그레이션 중단
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM missionary_region mr
  JOIN missionary m ON m.id = mr.missionary_id
  WHERE m.mission_group_id IS NULL;

  IF orphan_count > 0 THEN
    RAISE EXCEPTION 'migration blocked: % missionary_region row(s) are linked to missionaries without mission_group_id. Fix data before retrying.', orphan_count;
  END IF;
END $$;

-- 2. 새 컬럼 추가
ALTER TABLE "missionary_region" ADD COLUMN "mission_group_id" TEXT;

-- 3. 기존 데이터 변환: missionary를 통해 mission_group_id 매핑
UPDATE "missionary_region" mr
SET "mission_group_id" = m."mission_group_id"
FROM "missionary" m
WHERE m."id" = mr."missionary_id";

-- 4. NOT NULL 제약 추가
ALTER TABLE "missionary_region" ALTER COLUMN "mission_group_id" SET NOT NULL;

-- 5. 기존 FK 제약 및 컬럼 제거
ALTER TABLE "missionary_region" DROP CONSTRAINT IF EXISTS "missionary_region_missionary_id_fkey";
ALTER TABLE "missionary_region" DROP COLUMN "missionary_id";

-- 6. 새 FK 제약 추가
ALTER TABLE "missionary_region" ADD CONSTRAINT "missionary_region_mission_group_id_fkey"
  FOREIGN KEY ("mission_group_id") REFERENCES "mission_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
