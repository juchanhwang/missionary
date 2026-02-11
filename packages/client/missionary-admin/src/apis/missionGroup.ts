import api from './instance';

export interface MissionGroup {
  id: string;
  name: string;
  description?: string;
  type: 'DOMESTIC' | 'ABROAD';
}

export interface CreateMissionGroupPayload {
  name: string;
  description?: string;
  type: 'DOMESTIC' | 'ABROAD';
}

export const missionGroupApi = {
  getMissionGroups() {
    return api.get<MissionGroup[]>('/mission-groups');
  },
  createMissionGroup(data: CreateMissionGroupPayload) {
    return api.post<MissionGroup>('/mission-groups', data);
  },
};
