-- MissionaryRegion FK 변경: missionary_id → mission_group_id
-- 연계지를 차수(Missionary) 단위에서 선교 그룹(MissionGroup) 단위로 전환

-- 1. 사전 검증: mission_group_id가 NULL인 차수에 속한 연계지가 있으면 안 됨
-- 아래 쿼리가 0이 아닌 결과를 반환하면 마이그레이션 전 데이터 정리 필요
-- SELECT COUNT(*) FROM missionary_region mr
-- JOIN missionary m ON m.id = mr.missionary_id
-- WHERE m.mission_group_id IS NULL;

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
