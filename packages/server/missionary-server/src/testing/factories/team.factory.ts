import { randomUUID } from 'crypto';

import type { Team, TeamMember } from '../../../prisma/generated/prisma';

export function makeTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: randomUUID(),
    teamName: '테스트팀',
    leaderUserId: randomUUID(),
    leaderUserName: '테스트리더',
    missionaryId: randomUUID(),
    churchId: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: null,
    updatedBy: null,
    version: 0,
    deletedAt: null,
    ...overrides,
  };
}

export function makeTeamMember(
  overrides: Partial<TeamMember> = {},
): TeamMember {
  return {
    id: randomUUID(),
    teamId: randomUUID(),
    userId: randomUUID(),
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    createdBy: null,
    updatedBy: null,
    version: 0,
    deletedAt: null,
    ...overrides,
  };
}
