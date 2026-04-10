import { getServerEnrollmentSummary } from 'apis/enrollment.server';
import { getServerMissionGroupRegions } from 'apis/missionaryRegion.server';
import { getServerParticipations } from 'apis/participation.server';
import { getServerTeams } from 'apis/team.server';

import { TeamManagementPage } from './_components/TeamManagementPage';

interface TeamsRouteParams {
  params: Promise<{ missionaryId: string }>;
}

export default async function TeamsRoute({ params }: TeamsRouteParams) {
  const { missionaryId } = await params;

  const [summaryData, teamsData, participationsData] = await Promise.all([
    getServerEnrollmentSummary(),
    getServerTeams({ missionaryId }),
    getServerParticipations({ missionaryId }),
  ]);

  const mission = summaryData.missions.find((m) => m.id === missionaryId);
  if (!mission) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-500">선교를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // regions는 missionGroupId에 의존 → mission 확보 후 순차 await
  const regionsData = mission.missionGroupId
    ? await getServerMissionGroupRegions(mission.missionGroupId)
    : { data: [], total: 0 };

  return (
    <TeamManagementPage
      mission={mission}
      initialTeams={teamsData}
      initialParticipations={participationsData}
      initialRegions={regionsData}
    />
  );
}
