import { randomUUID } from 'crypto';

import type {
  Terms,
  UserTermsAgreement,
} from '../../../prisma/generated/prisma';

export function makeTerms(overrides: Partial<Terms> = {}): Terms {
  return {
    id: randomUUID(),
    termsType: 'USING_OF_SERVICE',
    termsUrl: null,
    termsTitle: '테스트약관',
    termsDescription: null,
    isUsed: true,
    isEssential: false,
    seq: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: null,
    updatedBy: null,
    version: 0,
    deletedAt: null,
    ...overrides,
  };
}

export function makeUserTermsAgreement(
  overrides: Partial<UserTermsAgreement> = {},
): UserTermsAgreement {
  return {
    id: randomUUID(),
    isAgreed: false,
    userId: randomUUID(),
    termsId: randomUUID(),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: null,
    updatedBy: null,
    version: 0,
    deletedAt: null,
    ...overrides,
  };
}
