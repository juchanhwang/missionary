import type { MissionaryPoster } from '../../../prisma/generated/prisma';

export interface MissionaryPosterCreateInput {
  id?: string;
  missionaryId: string;
  name: string;
  path: string;
}

export interface MissionaryPosterRepository {
  create(data: MissionaryPosterCreateInput): Promise<MissionaryPoster>;
  findByMissionary(missionaryId: string): Promise<MissionaryPoster[]>;
  findByIdAndMissionary(
    id: string,
    missionaryId: string,
  ): Promise<MissionaryPoster | null>;
  delete(id: string): Promise<MissionaryPoster>;
}

export const MISSIONARY_POSTER_REPOSITORY = Symbol(
  'MISSIONARY_POSTER_REPOSITORY',
);
