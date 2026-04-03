import axios from 'axios';
import 'server-only';

import { createServerApi } from './serverInstance';

import type {
  EnrollmentMissionSummary,
  GetEnrollmentSummaryResponse,
  MissionCategory,
} from './enrollment';
import type { Missionary } from './missionary';

export async function getServerEnrollmentSummary(): Promise<GetEnrollmentSummaryResponse> {
  try {
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
      isAcceptingResponses: m.isAcceptingResponses ?? true,
      closedMessage: m.closedMessage ?? null,
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
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      throw error;
    }
    console.error('[enrollment] 등록 관리 데이터 조회 실패:', error);
    return {
      missions: [],
      totalRecruitingCount: 0,
      totalRecruitingParticipants: 0,
    };
  }
}
