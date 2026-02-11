import { type Missionary } from './missionary';
import api from './instance';

export interface MissionGroup {
  id: string;
  name: string;
  description?: string;
  type: 'DOMESTIC' | 'ABROAD';
  createdAt: string;
  _count?: { missionaries: number };
}

export interface MissionGroupDetail extends MissionGroup {
  missionaries: Missionary[];
}

export interface CreateMissionGroupPayload {
  name: string;
  description?: string;
  type: 'DOMESTIC' | 'ABROAD';
}

export interface UpdateMissionGroupPayload {
  name?: string;
  description?: string;
  type?: 'DOMESTIC' | 'ABROAD';
}

export const missionGroupApi = {
  getMissionGroups() {
    return api.get<MissionGroup[]>('/mission-groups');
  },

  getMissionGroup(id: string) {
    return api.get<MissionGroupDetail>(`/mission-groups/${id}`);
  },

  createMissionGroup(data: CreateMissionGroupPayload) {
    return api.post<MissionGroup>('/mission-groups', data);
  },

  updateMissionGroup(id: string, data: UpdateMissionGroupPayload) {
    return api.patch<MissionGroup>(`/mission-groups/${id}`, data);
  },

  deleteMissionGroup(id: string) {
    return api.delete(`/mission-groups/${id}`);
  },
};
