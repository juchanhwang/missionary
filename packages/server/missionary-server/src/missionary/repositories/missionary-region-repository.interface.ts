import type { MissionaryRegion } from '../../../prisma/generated/prisma';

export interface MissionaryRegionCreateInput {
  id?: string;
  missionaryId: string;
  name: string;
  visitPurpose?: string | null;
  pastorName?: string | null;
  pastorPhone?: string | null;
  addressBasic?: string | null;
  addressDetail?: string | null;
}

export interface MissionaryRegionUpdateInput {
  name?: string;
  visitPurpose?: string | null;
  pastorName?: string | null;
  pastorPhone?: string | null;
  addressBasic?: string | null;
  addressDetail?: string | null;
}

export interface RegionWithMissionary extends MissionaryRegion {
  missionary: {
    id: string;
    name: string;
    order: number | null;
    missionGroupId: string | null;
    missionGroup: {
      id: string;
      name: string;
    } | null;
  };
}

export interface FindAllRegionsParams {
  missionGroupId?: string;
  missionaryId?: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface FindAllRegionsResult {
  data: RegionWithMissionary[];
  total: number;
}

export interface MissionaryRegionRepository {
  create(data: MissionaryRegionCreateInput): Promise<MissionaryRegion>;
  findByMissionary(missionaryId: string): Promise<MissionaryRegion[]>;
  findByIdAndMissionary(
    id: string,
    missionaryId: string,
  ): Promise<MissionaryRegion | null>;
  delete(id: string): Promise<MissionaryRegion>;
  findAllWithFilters(
    params: FindAllRegionsParams,
  ): Promise<FindAllRegionsResult>;
  update(
    id: string,
    data: MissionaryRegionUpdateInput,
  ): Promise<MissionaryRegion>;
}

export const MISSIONARY_REGION_REPOSITORY = Symbol(
  'MISSIONARY_REGION_REPOSITORY',
);
