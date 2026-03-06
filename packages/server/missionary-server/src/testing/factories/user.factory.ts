import { randomUUID } from 'crypto';

import type { User } from '../../../prisma/generated/prisma';

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: randomUUID(),
    email: `user-${randomUUID().slice(0, 8)}@test.com`,
    name: '테스트유저',
    password: 'hashed-password',
    provider: 'LOCAL',
    providerId: null,
    role: 'USER',
    loginId: null,
    identityNumber: null,
    phoneNumber: null,
    birthDate: null,
    gender: null,
    isBaptized: false,
    baptizedAt: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: null,
    updatedBy: null,
    version: 0,
    deletedAt: null,
    ...overrides,
  };
}
