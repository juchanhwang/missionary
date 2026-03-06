import { randomUUID } from 'crypto';

import type { Church } from '../../../prisma/generated/prisma';

export function makeChurch(overrides: Partial<Church> = {}): Church {
  return {
    id: randomUUID(),
    name: '테스트교회',
    pastorName: null,
    pastorPhone: null,
    addressBasic: null,
    addressDetail: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: null,
    updatedBy: null,
    version: 0,
    deletedAt: null,
    ...overrides,
  };
}
