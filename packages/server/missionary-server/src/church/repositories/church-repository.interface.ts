import type { BaseRepository } from '@/common/repositories';

import type { Church, Prisma } from '../../../prisma/generated/prisma';

export type ChurchCreateInput = Prisma.ChurchUncheckedCreateInput;

export type ChurchUpdateInput = Prisma.ChurchUncheckedUpdateInput;

export interface ChurchRepository extends BaseRepository<
  Church,
  ChurchCreateInput,
  ChurchUpdateInput
> {
  findAll(): Promise<Church[]>;
  findById(id: string): Promise<Church | null>;
}

export const CHURCH_REPOSITORY = Symbol('CHURCH_REPOSITORY');
