import api from './instance';
import { stripEmpty } from './utils';

// === 타입 정의 ===

export interface AttendanceOption {
  id: string;
  missionaryId: string;
  type: 'FULL' | 'PARTIAL';
  label: string;
  order: number;
}

export interface FormFieldDefinition {
  id: string;
  missionaryId: string;
  fieldType: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'DATE';
  label: string;
  placeholder: string | null;
  isRequired: boolean;
  order: number;
  options: string[] | null;
  hasAnswers: boolean;
}

export interface FormAnswer {
  id: string;
  formFieldId: string;
  value: string;
}

export interface ParticipationTeam {
  id: string;
  teamName: string;
}

export interface Participation {
  id: string;
  name: string;
  birthDate: string;
  applyFee: number | null;
  isPaid: boolean;
  identificationNumber: string | null;
  isOwnCar: boolean;
  missionaryId: string;
  userId: string;
  teamId: string | null;
  team: ParticipationTeam | null;
  createdAt: string;
  affiliation: string;
  attendanceOptionId: string;
  attendanceOption: AttendanceOption | null;
  cohort: number;
  hasPastParticipation: boolean | null;
  isCollegeStudent: boolean | null;
  formAnswers: FormAnswer[];
}

export interface GetParticipationsParams {
  missionaryId: string;
  limit?: number;
  offset?: number;
  isPaid?: boolean;
  attendanceType?: 'FULL' | 'PARTIAL';
  query?: string;
}

export interface PaginatedParticipationsResponse {
  data: Participation[];
  total: number;
}

export interface UpdateParticipationPayload {
  affiliation?: string;
  attendanceOptionId?: string;
  cohort?: number;
  hasPastParticipation?: boolean;
  isCollegeStudent?: boolean;
  isPaid?: boolean;
  answers?: { formFieldId: string; value: string }[];
  /**
   * 팀 배치 ID. `null`로 보내면 미배치 상태로 되돌린다.
   * BE Wave 4: `PATCH /participations/:id { teamId }` 지원.
   */
  teamId?: string | null;
}

// === API 함수 ===

export const participationApi = {
  getParticipations(params: GetParticipationsParams) {
    return api.get<PaginatedParticipationsResponse>('/participations', {
      params: stripEmpty(params),
    });
  },

  getParticipation(id: string) {
    return api.get<Participation>(`/participations/${id}`);
  },

  updateParticipation(id: string, data: UpdateParticipationPayload) {
    return api.patch<Participation>(`/participations/${id}`, data);
  },

  bulkApprovePayment(participationIds: string[]) {
    return api.put('/participations/approve', { participationIds });
  },

  downloadCsv(missionaryId: string) {
    return api.get<Blob>(`/participations/download/${missionaryId}`, {
      responseType: 'blob',
    });
  },
};
