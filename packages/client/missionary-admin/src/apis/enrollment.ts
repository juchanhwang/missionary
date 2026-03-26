import api from './instance';

// === 메인 페이지 선교 요약 타입 ===

export type MissionCategory = 'DOMESTIC' | 'OVERSEAS';

export type EnrollmentStatus =
  | 'ENROLLMENT_PREPARING'
  | 'ENROLLMENT_OPENED'
  | 'ENROLLMENT_CLOSED'
  | 'COMPLETED';

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
}

export interface GetEnrollmentSummaryResponse {
  missions: EnrollmentMissionSummary[];
  totalRecruitingCount: number;
  totalRecruitingParticipants: number;
}

// === API 함수 ===

export const enrollmentApi = {
  getEnrollmentSummary() {
    return api.get<GetEnrollmentSummaryResponse>('/enrollment/summary');
  },
};
