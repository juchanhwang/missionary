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
  missionaryId: string;
  missionary: {
    id: string;
    name: string;
    order?: number;
    missionGroup: {
      id: string;
      name: string;
    } | null;
  };
}

export interface RegionListResponse {
  data: RegionListItem[];
  total: number;
}

export interface GetRegionsParams {
  missionGroupId?: string;
  missionaryId?: string;
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
  missionaryId?: string;
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

  createRegion(missionaryId: string, data: CreateRegionPayload) {
    return api.post(`/missionaries/${missionaryId}/regions`, data);
  },

  updateRegion(
    missionaryId: string,
    regionId: string,
    data: UpdateRegionPayload,
  ) {
    return api.patch(`/missionaries/${missionaryId}/regions/${regionId}`, data);
  },

  deleteRegion(missionaryId: string, regionId: string) {
    return api.delete(`/missionaries/${missionaryId}/regions/${regionId}`);
  },
};
