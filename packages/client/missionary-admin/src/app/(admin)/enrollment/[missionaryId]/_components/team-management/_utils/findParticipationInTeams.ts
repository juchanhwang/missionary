import type { Participation } from 'apis/participation';

/**
 * `GroupedParticipations.byTeamId`에서 participationId로 참가자를 찾는다.
 *
 * 팀 여러 개의 배열을 순회하며 첫 매치를 반환한다. 동일 participation이 복수
 * 팀에 중복 존재하는 케이스는 `groupParticipationsByTeam`에서 방지되므로
 * 여기서는 중복 검증을 하지 않는다.
 *
 * DnD source lookup(`handleDragStart`) 및 스크린리더 announcements
 * 양쪽에서 사용되므로 공용 유틸로 분리한다.
 */
export function findParticipationInTeams(
  byTeamId: Map<string, Participation[]>,
  participationId: string,
): Participation | undefined {
  for (const members of byTeamId.values()) {
    const found = members.find((m) => m.id === participationId);
    if (found) return found;
  }
  return undefined;
}
