import { getServerAttendanceOptions } from 'apis/attendanceOption.server';
import { getServerEnrollmentSummary } from 'apis/enrollment.server';
import { getServerMissionEnrollmentSummary } from 'apis/enrollment.summary.server';
import { getServerFormFields } from 'apis/formField.server';
import { getServerParticipations } from 'apis/participation.server';
import { Suspense } from 'react';

import { EnrollmentDetailContent } from './_components/EnrollmentDetailContent';
import { EnrollmentDetailContentSkeleton } from './_components/EnrollmentDetailContentSkeleton';
import { EnrollmentDetailHeader } from './_components/EnrollmentDetailHeader';

interface EnrollmentDetailPageParams {
  params: Promise<{ missionaryId: string }>;
}

export default async function EnrollmentDetailRoute({
  params,
}: EnrollmentDetailPageParams) {
  const { missionaryId } = await params;

  // 5개 fetcher를 await 전에 모두 kick off → 병렬 fetch 보장
  const summaryPromise = getServerEnrollmentSummary();
  const participationsPromise = getServerParticipations({
    missionaryId,
    limit: 20,
    offset: 0,
  });
  const enrollmentSummaryPromise =
    getServerMissionEnrollmentSummary(missionaryId);
  const formFieldsPromise = getServerFormFields(missionaryId);
  const attendanceOptionsPromise = getServerAttendanceOptions(missionaryId);

  // 헤더 렌더 + 라우팅 검증을 위해 summary만 await
  const summaryData = await summaryPromise;
  const mission = summaryData.missions.find((m) => m.id === missionaryId);

  if (!mission) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-500">선교를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 헤더는 mission이 결정된 즉시 렌더되어 사용자에게 컨텍스트(미션 이름, 배지 등)를 노출.
  // 나머지 데이터 4개는 Suspense 내부의 EnrollmentDetailContent에서 use()로 unwrap되며,
  // 미해결 상태에서는 EnrollmentDetailContentSkeleton이 표시된다.
  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0">
      <div className="flex flex-col flex-1 p-8 gap-5 min-h-0">
        <EnrollmentDetailHeader mission={mission} />

        <Suspense fallback={<EnrollmentDetailContentSkeleton />}>
          <EnrollmentDetailContent
            mission={mission}
            participationsPromise={participationsPromise}
            enrollmentSummaryPromise={enrollmentSummaryPromise}
            formFieldsPromise={formFieldsPromise}
            attendanceOptionsPromise={attendanceOptionsPromise}
          />
        </Suspense>
      </div>
    </div>
  );
}
