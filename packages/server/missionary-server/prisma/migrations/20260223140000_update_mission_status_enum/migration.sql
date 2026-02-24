-- AlterEnum: MissionStatus (RECRUITING → ENROLLMENT_OPENED + ENROLLMENT_CLOSED 추가)
-- PostgreSQL은 ADD VALUE 후 같은 트랜잭션에서 사용 불가 → enum 재생성 방식 사용

-- 1. 기존 enum을 old로 이름 변경
ALTER TYPE "MissionStatus" RENAME TO "MissionStatus_old";

-- 2. 새 enum 생성
CREATE TYPE "MissionStatus" AS ENUM ('ENROLLMENT_OPENED', 'ENROLLMENT_CLOSED', 'IN_PROGRESS', 'COMPLETED');

-- 3. 컬럼 타입 변환 (RECRUITING → ENROLLMENT_OPENED 매핑 포함)
ALTER TABLE "missionary" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "missionary" ALTER COLUMN "status" TYPE "MissionStatus"
  USING (
    CASE "status"::text
      WHEN 'RECRUITING' THEN 'ENROLLMENT_OPENED'::"MissionStatus"
      ELSE "status"::text::"MissionStatus"
    END
  );
ALTER TABLE "missionary" ALTER COLUMN "status" SET DEFAULT 'ENROLLMENT_OPENED';

-- 4. 이전 enum 제거
DROP TYPE "MissionStatus_old";
