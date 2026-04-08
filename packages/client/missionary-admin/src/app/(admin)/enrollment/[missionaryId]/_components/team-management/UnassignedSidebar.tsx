'use client';

import { useDndContext, useDroppable } from '@dnd-kit/core';
import { CheckCircle2 } from 'lucide-react';

import { UnassignedParticipantCard } from './UnassignedParticipantCard';

import type { DragData, DropData } from './types';
import type { Participation } from 'apis/participation';

interface UnassignedSidebarProps {
  unassigned: Participation[];
}

/**
 * 미배치 참가자 사이드바. ui-spec §3-3, §4-2, §5-3.
 *
 * - 정적 레이아웃 (w-[260px] 고정, sticky self-start)
 * - 헤더("미배치" + 카운트)
 * - `useDroppable({ id: 'unassigned' })`: 팀 → 미배치로 되돌리는 드롭 타깃
 * - 드래그 시각 상태:
 *   - **idle**: `bg-gray-50 border-gray-200`
 *   - **highlighted** (팀에서 드래그 시작 — 미배치로 되돌릴 수 있음):
 *     `border-2 border-dashed border-blue-200 bg-blue-50/20`
 *   - **isOver** (호버): `bg-blue-50 border-blue-300`
 * - 미배치에서 드래그 시작한 경우 자기가 소스이므로 highlighted 제외.
 */
export function UnassignedSidebar({ unassigned }: UnassignedSidebarProps) {
  const dropData: DropData = { type: 'unassigned' };
  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned',
    data: dropData,
  });

  const { active } = useDndContext();
  const dragData = active?.data.current as DragData | undefined;
  // 팀에서 드래그 중일 때만 강조 (미배치에서 드래그 시작 시 자기가 소스).
  const isHighlighted =
    active !== null && dragData?.fromTeamId !== null && !isOver;

  return (
    <aside
      ref={setNodeRef}
      data-testid="unassigned-sidebar"
      aria-label="미배치 참가자 목록"
      className={`w-[260px] shrink-0 self-start sticky top-0 rounded-xl p-3 max-h-[calc(100vh-200px)] overflow-y-auto transition-colors ${
        isOver
          ? 'border border-blue-300 bg-blue-50'
          : isHighlighted
            ? 'border-2 border-dashed border-blue-200 bg-blue-50/20'
            : 'border border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2 px-1 py-1 mb-2">
        <span className="text-xs font-semibold text-gray-500">미배치</span>
        <span
          data-testid="unassigned-sidebar-count"
          className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500"
        >
          {unassigned.length}
        </span>
      </div>

      {unassigned.length === 0 ? (
        <UnassignedEmptyState />
      ) : (
        <div className="flex flex-col gap-1.5">
          {unassigned.map((participation) => (
            <UnassignedParticipantCard
              key={participation.id}
              participation={participation}
            />
          ))}
        </div>
      )}
    </aside>
  );
}

/**
 * 미배치 0명 Empty State. ui-spec §6-3.
 */
function UnassignedEmptyState() {
  return (
    <div
      data-testid="unassigned-empty-state"
      className="flex flex-col items-center justify-center gap-1 min-h-[80px] text-center"
    >
      <CheckCircle2 size={20} className="text-green-400" aria-hidden />
      <p className="text-xs text-gray-500">모두 배치 완료!</p>
    </div>
  );
}
