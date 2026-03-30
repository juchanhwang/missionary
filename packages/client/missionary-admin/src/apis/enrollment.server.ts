import 'server-only';

import { createServerApi } from './serverInstance';

import type {
  EnrollmentMissionSummary,
  GetEnrollmentSummaryResponse,
  MissionCategory,
} from './enrollment';
import type { Missionary } from './missionary';

export async function getServerEnrollmentSummary(): Promise<GetEnrollmentSummaryResponse> {
  const serverApi = await createServerApi();
  const { data: missionaries } =
    await serverApi.get<Missionary[]>('/missionaries');

  const missions: EnrollmentMissionSummary[] = missionaries.map((m) => ({
    id: m.id,
    name: m.name,
    order: m.order ?? null,
    category: (m.missionGroup?.category as MissionCategory) ?? 'DOMESTIC',
    status: m.status,
    enrollmentDeadline: m.participationEndDate ?? null,
    missionStartDate: m.startDate,
    missionEndDate: m.endDate,
    maximumParticipantCount: m.maximumParticipantCount ?? null,
    currentParticipantCount: m.currentParticipantCount,
    paidCount: 0,
    managerName: m.pastorName ?? null,
    missionGroupName: m.missionGroup?.name ?? null,
  }));

  const recruiting = missions.filter((m) => m.status === 'ENROLLMENT_OPENED');

  return {
    missions,
    totalRecruitingCount: recruiting.length,
    totalRecruitingParticipants: recruiting.reduce(
      (sum, m) => sum + m.currentParticipantCount,
      0,
    ),
  };
}
