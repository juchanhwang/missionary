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

export interface MissionaryRegionRepository {
  create(data: MissionaryRegionCreateInput): Promise<MissionaryRegion>;
  findByMissionary(missionaryId: string): Promise<MissionaryRegion[]>;
  findByIdAndMissionary(
    id: string,
    missionaryId: string,
  ): Promise<MissionaryRegion | null>;
  delete(id: string): Promise<MissionaryRegion>;
}

export const MISSIONARY_REGION_REPOSITORY = Symbol(
  'MISSIONARY_REGION_REPOSITORY',
);
