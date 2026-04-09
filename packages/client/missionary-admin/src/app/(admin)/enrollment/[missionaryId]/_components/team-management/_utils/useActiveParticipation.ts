'use client';

import { useDndContext } from '@dnd-kit/core';

import { findParticipationInTeams } from './findParticipationInTeams';

import type { DragData, GroupedParticipations } from '../types';
import type { Participation } from 'apis/participation';

/**
 * dnd-kit `useDndContext`를 구독해 현재 드래그 중인 참가자 객체를 lookup한다.
 *
 * 책임:
 * - `active` 가 null이면 `null` 반환 (드래그 진행 중 아님)
 * - `active.data.current.participationId`로 unassigned/byTeamId에서 매칭 찾기
 * - 찾지 못하면 `null` 반환
 *
 * `DndContext` 자식 트리에서만 호출 가능하다 (`useDndContext` 제약).
 *
 * Ghost 카드(§4-7), drag label(§4-6) 같은 시각 피드백에서 활성 카드 데이터가
 * 필요할 때 prop drilling 대신 이 훅으로 컴포넌트가 직접 구독한다.
 */
export function useActiveParticipation(
  grouped: GroupedParticipations,
): Participation | null {
  const { active } = useDndContext();
  if (active === null) return null;

  const data = active.data.current as DragData | undefined;
  if (data === undefined) return null;

  return (
    grouped.unassigned.find((p) => p.id === data.participationId) ??
    findParticipationInTeams(grouped.byTeamId, data.participationId) ??
    null
  );
}
