import api from './instance';
import { type MissionGroup } from './missionGroup';

export const MISSION_STATUSES = [
  'ENROLLMENT_OPENED',
  'ENROLLMENT_CLOSED',
  'IN_PROGRESS',
  'COMPLETED',
] as const;

export type MissionStatus = (typeof MISSION_STATUSES)[number];

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
  status: MissionStatus;
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
  status?: MissionStatus;
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
  status?: MissionStatus;
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
