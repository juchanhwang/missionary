import api from './instance';
import { type MissionGroup } from './missionGroup';

export interface Missionary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  pastorName?: string;
  pastorPhone?: string;
  participationStartDate: string;
  participationEndDate: string;
  price?: number;
  description?: string;
  maximumParticipantCount?: number;
  bankName?: string;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
  missionGroupId?: string;
  order?: number;
  missionGroup?: MissionGroup;
  status:
    | 'ENROLLMENT_OPENED'
    | 'ENROLLMENT_CLOSED'
    | 'IN_PROGRESS'
    | 'COMPLETED';
  createdAt: string;
}

export interface CreateMissionaryPayload {
  name: string;
  startDate: string;
  endDate: string;
  pastorName?: string;
  pastorPhone?: string;
  participationStartDate?: string;
  participationEndDate?: string;
  price?: number;
  description?: string;
  maximumParticipantCount?: number;
  bankName?: string;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
  missionGroupId?: string;
  order?: number;
  status?:
    | 'ENROLLMENT_OPENED'
    | 'ENROLLMENT_CLOSED'
    | 'IN_PROGRESS'
    | 'COMPLETED';
}

export interface UpdateMissionaryPayload {
  name?: string;
  startDate?: string;
  endDate?: string;
  pastorName?: string;
  pastorPhone?: string;
  participationStartDate?: string;
  participationEndDate?: string;
  price?: number;
  description?: string;
  maximumParticipantCount?: number;
  bankName?: string;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
  status?:
    | 'ENROLLMENT_OPENED'
    | 'ENROLLMENT_CLOSED'
    | 'IN_PROGRESS'
    | 'COMPLETED';
}

export const missionaryApi = {
  getMissionaries() {
    return api.get<Missionary[]>('/missionaries');
  },

  getMissionary(id: string) {
    return api.get<Missionary>(`/missionaries/${id}`);
  },

  createMissionary(data: CreateMissionaryPayload) {
    return api.post<Missionary>('/missionaries', data);
  },

  updateMissionary(id: string, data: UpdateMissionaryPayload) {
    return api.patch<Missionary>(`/missionaries/${id}`, data);
  },

  deleteMissionary(id: string) {
    return api.delete(`/missionaries/${id}`);
  },
};
