import type {
  Missionary,
  MissionGroup,
  MissionaryPoster,
  MissionStatus,
} from '../../../prisma/generated/prisma';

export interface MissionaryCreateInput {
  id?: string;
  name: string;
  startDate: Date;
  endDate: Date;
  pastorName?: string | null;
  pastorPhone?: string | null;
  participationStartDate?: Date | null;
  participationEndDate?: Date | null;
  price?: number | null;
  description?: string | null;
  maximumParticipantCount?: number | null;
  bankName?: string | null;
  bankAccountHolder?: string | null;
  bankAccountNumber?: string | null;
  missionGroupId?: string | null;
  order?: number | null;
  createdById: string;
  status?: MissionStatus;
}

export interface MissionaryUpdateInput {
  name?: string;
  startDate?: Date;
  endDate?: Date;
  pastorName?: string | null;
  pastorPhone?: string | null;
  participationStartDate?: Date | null;
  participationEndDate?: Date | null;
  price?: number | null;
  description?: string | null;
  maximumParticipantCount?: number | null;
  bankName?: string | null;
  bankAccountHolder?: string | null;
  bankAccountNumber?: string | null;
  status?: MissionStatus;
}

export type MissionaryWithGroup = Missionary & {
  missionGroup: MissionGroup | null;
};

export type MissionaryWithDetails = Missionary & {
  missionGroup: MissionGroup | null;
  posters: MissionaryPoster[];
};

export interface MissionaryRepository {
  create(data: MissionaryCreateInput): Promise<MissionaryWithGroup>;
  findAll(): Promise<MissionaryWithGroup[]>;
  findWithDetails(id: string): Promise<MissionaryWithDetails | null>;
  update(id: string, data: MissionaryUpdateInput): Promise<MissionaryWithGroup>;
  delete(id: string): Promise<Missionary>;
  getMaxOrder(missionGroupId: string): Promise<number | null>;
  count(where: { missionGroupId?: string }): Promise<number>;
}

export const MISSIONARY_REPOSITORY = Symbol('MISSIONARY_REPOSITORY');
