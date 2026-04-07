import { getServerAttendanceOptions } from 'apis/attendanceOption.server';
import { getServerEnrollmentSummary } from 'apis/enrollment.server';
import { getServerMissionEnrollmentSummary } from 'apis/enrollment.summary.server';
import { getServerFormFields } from 'apis/formField.server';
import { getServerParticipations } from 'apis/participation.server';
import { Suspense } from 'react';

import { EnrollmentDetailPage } from './_components/EnrollmentDetailPage';
import { EnrollmentDetailPageSkeleton } from './_components/EnrollmentDetailPageSkeleton';

interface EnrollmentDetailPageParams {
  params: Promise<{ missionaryId: string }>;
}

export default async function EnrollmentDetailRoute({
  params,
}: EnrollmentDetailPageParams) {
  const { missionaryId } = await params;

  // 미션 검증을 위해 summary만 await — 미션이 없으면 즉시 not-found 렌더
  const summaryData = await getServerEnrollmentSummary();
  const mission = summaryData.missions.find((m) => m.id === missionaryId);

  if (!mission) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-500">선교를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 나머지 데이터는 await하지 않고 Promise로 클라이언트에 내려준다.
  // EnrollmentDetailPage 내부에서 use() 훅으로 unwrap되며,
  // 미해결 상태에서는 아래 Suspense fallback이 표시된다.
  const participationsPromise = getServerParticipations({
    missionaryId,
    limit: 20,
    offset: 0,
  });
  const enrollmentSummaryPromise =
    getServerMissionEnrollmentSummary(missionaryId);
  const formFieldsPromise = getServerFormFields(missionaryId);
  const attendanceOptionsPromise = getServerAttendanceOptions(missionaryId);

  return (
    <Suspense fallback={<EnrollmentDetailPageSkeleton />}>
      <EnrollmentDetailPage
        mission={mission}
        participationsPromise={participationsPromise}
        enrollmentSummaryPromise={enrollmentSummaryPromise}
        formFieldsPromise={formFieldsPromise}
        attendanceOptionsPromise={attendanceOptionsPromise}
      />
    </Suspense>
  );
}
