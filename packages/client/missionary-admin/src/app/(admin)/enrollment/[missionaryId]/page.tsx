import { getServerAttendanceOptions } from 'apis/attendanceOption.server';
import { getServerEnrollmentSummary } from 'apis/enrollment.server';
import { getServerMissionEnrollmentSummary } from 'apis/enrollment.summary.server';
import { getServerFormFields } from 'apis/formField.server';
import { getServerParticipations } from 'apis/participation.server';

import { EnrollmentDetailPage } from './_components/EnrollmentDetailPage';

interface EnrollmentDetailPageParams {
  params: Promise<{ missionaryId: string }>;
}

export default async function EnrollmentDetailRoute({
  params,
}: EnrollmentDetailPageParams) {
  const { missionaryId } = await params;

  // 5개 fetcher를 Promise.all로 병렬 await.
  // 로딩 상태는 loading.tsx (Next.js 자동 Suspense boundary)가 담당하고,
  // 에러는 라우트 error.tsx (ErrorBoundary)가 받는다.
  const [
    summaryData,
    participationsData,
    enrollmentSummaryData,
    formFieldsData,
    attendanceOptionsData,
  ] = await Promise.all([
    getServerEnrollmentSummary(),
    getServerParticipations({ missionaryId, limit: 20, offset: 0 }),
    getServerMissionEnrollmentSummary(missionaryId),
    getServerFormFields(missionaryId),
    getServerAttendanceOptions(missionaryId),
  ]);

  const mission = summaryData.missions.find((m) => m.id === missionaryId);

  if (!mission) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-500">선교를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <EnrollmentDetailPage
      mission={mission}
      initialParticipations={participationsData}
      initialEnrollmentSummary={enrollmentSummaryData}
      formFields={formFieldsData}
      attendanceOptions={attendanceOptionsData}
    />
  );
}
