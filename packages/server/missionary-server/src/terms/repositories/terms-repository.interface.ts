import type { BaseRepository } from '@/common/repositories';

import type { Terms, TermsType } from '../../../prisma/generated/prisma';

export interface TermsCreateInput {
  id?: string;
  termsType: TermsType;
  termsUrl?: string | null;
  termsTitle: string;
  termsDescription?: string | null;
  isUsed?: boolean;
  isEssential?: boolean;
  seq?: number | null;
}

export interface TermsUpdateInput {
  termsType?: TermsType;
  termsUrl?: string | null;
  termsTitle?: string;
  termsDescription?: string | null;
  isUsed?: boolean;
  isEssential?: boolean;
  seq?: number | null;
}

export interface TermsRepository extends BaseRepository<
  Terms,
  TermsCreateInput,
  TermsUpdateInput
> {
  findAllActive(): Promise<Terms[]>;
  findById(id: string): Promise<Terms | null>;
}

export const TERMS_REPOSITORY = Symbol('TERMS_REPOSITORY');
