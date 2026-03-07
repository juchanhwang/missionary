import type {
  TermsCreateInput,
  TermsRepository,
  TermsUpdateInput,
} from '@/terms/repositories/terms-repository.interface';

import { BaseFakeRepository } from './base-fake-repository';

import type { Terms, TermsType } from '../../../prisma/generated/prisma';

export class FakeTermsRepository
  extends BaseFakeRepository<Terms, TermsCreateInput, TermsUpdateInput>
  implements TermsRepository
{
  private seqCounter = 1;

  protected buildEntity(data: TermsCreateInput): Terms {
    const now = this.now();
    return {
      id: data.id ?? this.generateId(),
      termsType: data.termsType as TermsType,
      termsUrl: data.termsUrl ?? null,
      termsTitle: data.termsTitle,
      termsDescription: data.termsDescription ?? null,
      isUsed: data.isUsed ?? true,
      isEssential: data.isEssential ?? false,
      seq: data.seq ?? this.seqCounter++,
      createdAt: now,
      updatedAt: now,
      createdBy: null,
      updatedBy: null,
      version: 0,
      deletedAt: null,
    };
  }

  async findAllActive(): Promise<Terms[]> {
    return [...this.store.values()]
      .filter((terms) => terms.isUsed)
      .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
  }

  async findById(id: string): Promise<Terms | null> {
    return this.store.get(id) ?? null;
  }

  static withTerms(termsList: Terms[]): FakeTermsRepository {
    const repo = new FakeTermsRepository();
    for (const terms of termsList) {
      repo.store.set(terms.id, terms);
    }
    return repo;
  }
}
