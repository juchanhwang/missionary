import { describe, it, expect } from 'vitest';

import { groupParticipationsByTeam } from './groupParticipationsByTeam';

import type { Participation } from 'apis/participation';

/**
 * 테스트 fixture: Participation의 필수 일부 필드만 채운다.
 * 그룹핑 유틸은 `id`, `teamId`만 사용하므로 나머지 필드는 검증 대상이 아니다.
 */
function fixture(id: string, teamId: string | null): Participation {
  return { id, teamId } as unknown as Participation;
}

describe('groupParticipationsByTeam', () => {
  it('teamId가 null인 참가자를 unassigned로 분리한다', () => {
    const participations = [
      fixture('p1', null),
      fixture('p2', null),
      fixture('p3', 'team-a'),
    ];

    const { byTeamId, unassigned } = groupParticipationsByTeam(participations);

    expect(unassigned.map((p) => p.id)).toEqual(['p1', 'p2']);
    expect(byTeamId.get('team-a')?.map((p) => p.id)).toEqual(['p3']);
  });

  it('동일 teamId의 참가자들을 같은 배열로 모은다', () => {
    const participations = [
      fixture('p1', 'team-a'),
      fixture('p2', 'team-a'),
      fixture('p3', 'team-b'),
      fixture('p4', 'team-a'),
    ];

    const { byTeamId } = groupParticipationsByTeam(participations);

    expect(byTeamId.get('team-a')?.map((p) => p.id)).toEqual([
      'p1',
      'p2',
      'p4',
    ]);
    expect(byTeamId.get('team-b')?.map((p) => p.id)).toEqual(['p3']);
  });

  it('빈 입력은 빈 결과를 반환한다', () => {
    const { byTeamId, unassigned } = groupParticipationsByTeam([]);

    expect(byTeamId.size).toBe(0);
    expect(unassigned).toEqual([]);
  });

  it('멤버가 아무도 없는 teamId는 byTeamId 키에 존재하지 않는다', () => {
    const participations = [fixture('p1', 'team-a'), fixture('p2', null)];

    const { byTeamId } = groupParticipationsByTeam(participations);

    expect(byTeamId.has('team-a')).toBe(true);
    expect(byTeamId.has('team-b')).toBe(false);
    expect(byTeamId.size).toBe(1);
  });

  it('입력 순서를 보존한다', () => {
    const participations = [
      fixture('p3', 'team-a'),
      fixture('p1', 'team-a'),
      fixture('p2', 'team-a'),
    ];

    const { byTeamId } = groupParticipationsByTeam(participations);

    expect(byTeamId.get('team-a')?.map((p) => p.id)).toEqual([
      'p3',
      'p1',
      'p2',
    ]);
  });
});
