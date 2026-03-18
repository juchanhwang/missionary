import api from './instance';

export interface MissionaryRegion {
  id: number;
  name: string;
  visitPurpose: string | null;
  pastorName: string | null;
  pastorPhone: string | null;
  addressBasic: string | null;
  addressDetail: string | null;
  missionaryId: number;
}

export interface CreateMissionaryRegionPayload {
  name: string;
  visitPurpose?: string;
  pastorName?: string;
  pastorPhone?: string;
  addressBasic?: string;
  addressDetail?: string;
}

export interface UpdateMissionaryRegionPayload {
  name?: string;
  visitPurpose?: string;
  pastorName?: string;
  pastorPhone?: string;
  addressBasic?: string;
  addressDetail?: string;
}

export const missionaryRegionApi = {
  getRegions(missionaryId: number) {
    return api.get<MissionaryRegion[]>(`/missionaries/${missionaryId}/regions`);
  },

  createRegion(missionaryId: number, data: CreateMissionaryRegionPayload) {
    return api.post<MissionaryRegion>(
      `/missionaries/${missionaryId}/regions`,
      data,
    );
  },

  updateRegion(
    missionaryId: number,
    regionId: number,
    data: UpdateMissionaryRegionPayload,
  ) {
    return api.patch<MissionaryRegion>(
      `/missionaries/${missionaryId}/regions/${regionId}`,
      data,
    );
  },

  deleteRegion(missionaryId: number, regionId: number) {
    return api.delete(`/missionaries/${missionaryId}/regions/${regionId}`);
  },
};
