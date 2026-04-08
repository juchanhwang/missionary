'use client';

import { useDndContext } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';

import { getParticipationSubText } from './_utils/getParticipationSubText';

import type { DropData } from './types';
import type { Participation } from 'apis/participation';
import type { Team } from 'apis/team';

interface DragOverlayCardProps {
  participation: Participation;
  /** drag label에서 teamId → teamName 변환에 사용. */
  teams: Team[];
}

/**
 * `DragOverlay` 내부에 렌더되는 floating 카드. ui-spec §4-6, mockup `.drag-floating`/`.drag-label`.
 *
 * mockup 토큰:
 * - 카드: `shadow-xl ring-1 ring-blue-30 rotate-[1.5deg] bg-white`
 * - drag label: `bg-blue-10 text-blue-60 border border-blue-30 rounded-md px-2 py-0.5 text-[11px] font-semibold`
 *
 * 호버 중인 드롭 타깃 정보는 `useDndContext().over`로 직접 구독한다.
 * `KanbanBoard`가 `DragOverlay` 슬롯에 주입한다.
 *
 * 드래그 중 실제 카드는 opacity-30으로 반투명 처리되고, 이 overlay는
 * rotate-[1.5deg] tilt로 포인터에 고정되어 구분된다.
 */
export function DragOverlayCard({
  participation,
  teams,
}: DragOverlayCardProps) {
  const subText = getParticipationSubText(participation);
  const overLabel = useOverLabel(teams);

  return (
    <div
      data-testid="drag-overlay-card"
      className="relative flex items-start gap-2 bg-white border border-blue-30 rounded-lg px-2.5 py-2 shadow-xl ring-1 ring-blue-30 rotate-[1.5deg] w-[200px]"
    >
      {overLabel !== null && (
        <span
          data-testid="drag-overlay-label"
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center bg-blue-10 text-blue-60 border border-blue-30 rounded-md px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap shadow-sm"
        >
          → {overLabel}
        </span>
      )}
      <GripVertical
        size={14}
        aria-hidden
        className="text-gray-300 mt-0.5 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {participation.name}
        </p>
        {subText !== null && (
          <p className="text-xs text-gray-400 truncate">{subText}</p>
        )}
      </div>
    </div>
  );
}

/**
 * 현재 호버 중인 드롭 타깃의 라벨 텍스트.
 * - 팀: 해당 팀명 (`teams`에 없으면 `null` — race condition 방어)
 * - 미배치: "미배치"
 * - 호버 없음: `null`
 */
function useOverLabel(teams: Team[]): string | null {
  const { over } = useDndContext();
  if (over === null) return null;

  const data = over.data.current as DropData | undefined;
  if (data === undefined) return null;

  if (data.type === 'unassigned') return '미배치';
  return teams.find((t) => t.id === data.teamId)?.teamName ?? null;
}
