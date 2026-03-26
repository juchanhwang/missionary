import { getServerEnrollmentSummary } from 'apis/enrollment.server';
import { getServerParticipations } from 'apis/participation.server';

import { EnrollmentDetailPage } from './_components/EnrollmentDetailPage';

interface EnrollmentDetailPageParams {
  params: Promise<{ missionaryId: string }>;
}

export default async function EnrollmentDetailRoute({
  params,
}: EnrollmentDetailPageParams) {
  const { missionaryId } = await params;

  const [summaryData, participationsData] = await Promise.all([
    getServerEnrollmentSummary(),
    getServerParticipations({ missionaryId, page: 1, pageSize: 20 }),
  ]);

  const mission = summaryData.missions.find((m) => m.id === missionaryId);

  if (!mission) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-500">선교를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // TODO: formFields, attendanceOptions는 BE API 완성 후 실제 데이터로 교체
  return (
    <EnrollmentDetailPage
      mission={mission}
      initialParticipations={participationsData}
      formFields={[]}
      attendanceOptions={[]}
    />
  );
}
