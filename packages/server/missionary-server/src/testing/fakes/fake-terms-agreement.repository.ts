import { randomUUID } from 'crypto';

import type {
  AgreementCreateInput,
  AgreementWithRelations,
  TermsAgreementRepository,
} from '@/terms/repositories/terms-agreement-repository.interface';

import type { UserTermsAgreement } from '../../../prisma/generated/prisma';

export class FakeTermsAgreementRepository implements TermsAgreementRepository {
  private store = new Map<string, AgreementWithRelations>();

  async findByTermsAndUser(
    termsId: string,
    userId: string,
  ): Promise<UserTermsAgreement | null> {
    return (
      [...this.store.values()].find(
        (a) => a.termsId === termsId && a.userId === userId,
      ) ?? null
    );
  }

  async createWithRelations(
    data: AgreementCreateInput,
  ): Promise<AgreementWithRelations> {
    const now = new Date();
    const id = randomUUID();
    const entity: AgreementWithRelations = {
      id,
      termsId: data.termsId,
      userId: data.userId,
      isAgreed: data.isAgreed ?? true,
      createdAt: now,
      updatedAt: now,
      createdBy: null,
      updatedBy: null,
      version: 0,
      deletedAt: null,
      terms: {
        id: data.termsId,
        termsType: 'USING_OF_SERVICE' as any,
        termsUrl: null,
        termsTitle: 'stub',
        termsDescription: null,
        isUsed: true,
        isEssential: false,
        seq: null,
        createdAt: now,
        updatedAt: now,
        createdBy: null,
        updatedBy: null,
        version: 0,
        deletedAt: null,
      },
      user: {
        id: data.userId,
        email: null,
        name: null,
      },
    };
    this.store.set(id, entity);
    return entity;
  }

  async findByUser(userId: string): Promise<AgreementWithRelations[]> {
    return [...this.store.values()]
      .filter((a) => a.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // 테스트 제어 메서드
  clear(): void {
    this.store.clear();
  }

  getAll(): AgreementWithRelations[] {
    return [...this.store.values()];
  }

  static withAgreements(
    agreements: AgreementWithRelations[],
  ): FakeTermsAgreementRepository {
    const repo = new FakeTermsAgreementRepository();
    for (const agreement of agreements) {
      repo.store.set(agreement.id, agreement);
    }
    return repo;
  }
}
