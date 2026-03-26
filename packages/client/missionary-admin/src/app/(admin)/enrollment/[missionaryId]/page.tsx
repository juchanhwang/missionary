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
    getServerParticipations({ missionaryId, limit: 20, offset: 0 }),
  ]);

  const mission = summaryData.missions.find((m) => m.id === missionaryId);

  if (!mission) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-500">선교를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // TODO: BE API 완성 후 실제 SSR 데이터로 교체
  return (
    <EnrollmentDetailPage
      mission={mission}
      initialParticipations={participationsData}
      initialEnrollmentSummary={{
        totalParticipants: mission.currentParticipantCount,
        maxParticipants: mission.maximumParticipantCount,
        paidCount: mission.paidCount,
        unpaidCount: mission.currentParticipantCount - mission.paidCount,
        fullAttendanceCount: 0,
        partialAttendanceCount: 0,
      }}
      formFields={[]}
      attendanceOptions={[]}
    />
  );
}
