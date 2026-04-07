import { cache } from 'react';
import 'server-only';

import { createServerApi } from './serverInstance';

import type {
  EnrollmentMissionSummary,
  GetEnrollmentSummaryResponse,
  MissionCategory,
} from './enrollment';
import type { Missionary } from './missionary';

/**
 * 등록 관리 요약 조회.
 *
 * - `React.cache()`로 감싸 동일 렌더 내 중복 호출을 dedupe한다.
 * - 에러는 별도 가공 없이 그대로 throw하여 라우트 `error.tsx` ErrorBoundary가
 *   책임지도록 위임한다 (인증/권한 에러 포함).
 */
export const getServerEnrollmentSummary = cache(
  async (): Promise<GetEnrollmentSummaryResponse> => {
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
  },
);
