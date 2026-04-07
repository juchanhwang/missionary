import type { GroupedParticipations } from '../types';
import type { Participation } from 'apis/participation';

/**
 * 참가자 목록을 팀별로 그룹핑한다 (R-2 옵션 B: 클라이언트 그룹핑).
 *
 * - `teamId === null`인 참가자는 `unassigned` 배열로 분리
 * - `teamId`가 있는 참가자는 `byTeamId` Map에 같은 키로 모음
 * - 멤버 0명인 팀은 `byTeamId`에 키가 존재하지 않음 (팀 컬럼 측에서 빈 배열로 처리)
 *
 * 반환된 객체는 새 참조이므로 React Compiler가 안전하게 메모이즈할 수 있다.
 */
export function groupParticipationsByTeam(
  participations: Participation[],
): GroupedParticipations {
  const byTeamId = new Map<string, Participation[]>();
  const unassigned: Participation[] = [];

  for (const participation of participations) {
    if (participation.teamId === null) {
      unassigned.push(participation);
      continue;
    }

    const existing = byTeamId.get(participation.teamId);
    if (existing) {
      existing.push(participation);
    } else {
      byTeamId.set(participation.teamId, [participation]);
    }
  }

  return { byTeamId, unassigned };
}
