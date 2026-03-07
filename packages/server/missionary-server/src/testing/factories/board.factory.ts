import { randomUUID } from 'crypto';

import type { MissionaryBoard } from '../../../prisma/generated/prisma';

export function makeMissionaryBoard(
  overrides: Partial<MissionaryBoard> = {},
): MissionaryBoard {
  return {
    id: randomUUID(),
    type: 'NOTICE',
    title: '테스트게시글',
    content: '테스트게시글 내용입니다.',
    missionaryId: randomUUID(),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: null,
    updatedBy: null,
    version: 0,
    deletedAt: null,
    ...overrides,
  };
}
