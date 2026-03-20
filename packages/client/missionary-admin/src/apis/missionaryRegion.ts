import api from './instance';
import { stripEmpty } from './utils';

// === 타입 정의 ===

export interface RegionListItem {
  id: string;
  name: string;
  pastorName: string | null;
  pastorPhone: string | null;
  addressBasic: string | null;
  addressDetail: string | null;
  missionGroupId: string;
  missionGroup: {
    id: string;
    name: string;
  } | null;
}

export interface RegionListResponse {
  data: RegionListItem[];
  total: number;
}

export interface GetRegionsParams {
  missionGroupId?: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface CreateRegionPayload {
  name: string;
  pastorName?: string;
  pastorPhone?: string;
  addressBasic?: string;
  addressDetail?: string;
}

export interface UpdateRegionPayload {
  name?: string;
  pastorName?: string;
  pastorPhone?: string;
  addressBasic?: string;
  addressDetail?: string;
}

// === API ===

export const missionaryRegionApi = {
  getRegions(params?: GetRegionsParams) {
    return api.get<RegionListResponse>('/regions', {
      params: params ? stripEmpty(params) : undefined,
    });
  },

  createRegion(missionGroupId: string, data: CreateRegionPayload) {
    return api.post(`/mission-groups/${missionGroupId}/regions`, data);
  },

  updateRegion(
    missionGroupId: string,
    regionId: string,
    data: UpdateRegionPayload,
  ) {
    return api.patch(
      `/mission-groups/${missionGroupId}/regions/${regionId}`,
      data,
    );
  },

  deleteRegion(missionGroupId: string, regionId: string) {
    return api.delete(`/mission-groups/${missionGroupId}/regions/${regionId}`);
  },
};
