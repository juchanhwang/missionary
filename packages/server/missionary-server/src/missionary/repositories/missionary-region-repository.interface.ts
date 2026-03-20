import type { MissionaryRegion } from '../../../prisma/generated/prisma';

export interface MissionaryRegionCreateInput {
  id?: string;
  missionGroupId: string;
  name: string;
  pastorName?: string | null;
  pastorPhone?: string | null;
  addressBasic?: string | null;
  addressDetail?: string | null;
}

export interface MissionaryRegionUpdateInput {
  name?: string;
  pastorName?: string | null;
  pastorPhone?: string | null;
  addressBasic?: string | null;
  addressDetail?: string | null;
}

export interface RegionWithMissionGroup extends MissionaryRegion {
  missionGroup: {
    id: string;
    name: string;
  };
}

export interface FindAllRegionsParams {
  missionGroupId?: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface FindAllRegionsResult {
  data: RegionWithMissionGroup[];
  total: number;
}

export interface MissionaryRegionRepository {
  create(data: MissionaryRegionCreateInput): Promise<MissionaryRegion>;
  findByMissionGroup(missionGroupId: string): Promise<MissionaryRegion[]>;
  findByIdAndMissionGroup(
    id: string,
    missionGroupId: string,
  ): Promise<MissionaryRegion | null>;
  delete(id: string): Promise<MissionaryRegion>;
  findAllWithFilters(
    params: FindAllRegionsParams,
  ): Promise<FindAllRegionsResult>;
  findDeletedWithFilters(
    params: FindAllRegionsParams,
  ): Promise<FindAllRegionsResult>;
  findDeletedByIdAndMissionGroup(
    id: string,
    missionGroupId: string,
  ): Promise<MissionaryRegion | null>;
  restore(id: string): Promise<MissionaryRegion>;
  update(
    id: string,
    data: MissionaryRegionUpdateInput,
  ): Promise<MissionaryRegion>;
}

export const MISSIONARY_REGION_REPOSITORY = Symbol(
  'MISSIONARY_REGION_REPOSITORY',
);
