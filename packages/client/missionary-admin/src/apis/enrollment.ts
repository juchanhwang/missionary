import api from './instance';

import type { Missionary, MissionStatus } from './missionary';

// === 메인 페이지 선교 요약 타입 ===

export type MissionCategory = 'DOMESTIC' | 'ABROAD';

export type EnrollmentStatus = MissionStatus;

export interface EnrollmentMissionSummary {
  id: string;
  name: string;
  order: number | null;
  category: MissionCategory;
  status: EnrollmentStatus;
  enrollmentDeadline: string | null;
  missionStartDate: string;
  missionEndDate: string;
  maximumParticipantCount: number | null;
  currentParticipantCount: number;
  paidCount: number;
  managerName: string | null;
  missionGroupName: string | null;
  isAcceptingResponses: boolean;
  closedMessage: string | null;
}

export interface GetEnrollmentSummaryResponse {
  missions: EnrollmentMissionSummary[];
  totalRecruitingCount: number;
  totalRecruitingParticipants: number;
}

// === 상세 페이지 등록 통계 ===

export interface MissionEnrollmentSummary {
  totalParticipants: number;
  maxParticipants: number | null;
  paidCount: number;
  unpaidCount: number;
  fullAttendanceCount: number;
  partialAttendanceCount: number;
}

// === 변환 함수 ===

function toEnrollmentSummary(
  missionaries: Missionary[],
): GetEnrollmentSummaryResponse {
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
    paidCount: 0, // GET /missionaries에서 제공하지 않음
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
}

// === API 함수 ===

export const enrollmentApi = {
  async getEnrollmentSummary() {
    const response = await api.get<Missionary[]>('/missionaries');
    return { ...response, data: toEnrollmentSummary(response.data) };
  },

  getMissionEnrollmentSummary(missionaryId: string) {
    return api.get<MissionEnrollmentSummary>(
      `/participations/enrollment-summary/${missionaryId}`,
    );
  },
};
