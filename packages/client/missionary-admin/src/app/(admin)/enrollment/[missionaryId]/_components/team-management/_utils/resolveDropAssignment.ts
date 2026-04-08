import type { DragData, DropData } from '../types';

/**
 * 드래그앤드롭 종료 시 실제 mutation을 발생시켜야 하는지 결정하는 순수 함수.
 * fe-plan v1.2 §3-3.
 *
 * 반환 값:
 * - `null`: noop (drag cancel / same-container drop / 잘못된 페이로드)
 * - `{ participationId, teamId }`: 이 값으로 `useAssignParticipationToTeam.mutate` 호출
 *
 * 규칙:
 * - `dragData`/`dropData`가 비어있으면 noop
 * - `dropData.type === 'unassigned'` → 새 teamId = null
 * - `dropData.type === 'team'` → 새 teamId = dropData.teamId
 * - 출발 컨테이너(`fromTeamId`)와 도착 컨테이너가 같으면 noop
 */
export function resolveDropAssignment(
  dragData: DragData | undefined,
  dropData: DropData | undefined,
): { participationId: string; teamId: string | null } | null {
  if (!dragData || !dropData) return null;

  const nextTeamId = dropData.type === 'unassigned' ? null : dropData.teamId;

  if (dragData.fromTeamId === nextTeamId) return null;

  return { participationId: dragData.participationId, teamId: nextTeamId };
}
