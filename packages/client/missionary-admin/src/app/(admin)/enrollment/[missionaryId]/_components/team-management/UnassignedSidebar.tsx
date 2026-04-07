'use client';

import { CheckCircle2 } from 'lucide-react';

import { UnassignedParticipantCard } from './UnassignedParticipantCard';

import type { Participation } from 'apis/participation';

interface UnassignedSidebarProps {
  unassigned: Participation[];
}

/**
 * 미배치 참가자 사이드바. ui-spec §3-3, §4-2.
 *
 * W2-2 범위:
 * - 정적 레이아웃 (w-[260px] 고정, sticky self-start)
 * - 헤더("미배치" + 카운트)
 * - 카드 리스트 placeholder (이름만) — W2-3에서 `UnassignedParticipantCard`로 교체
 * - 빈 상태("모두 배치 완료!")
 *
 * W4에서 `useDroppable({ id: 'unassigned' })`로 팀 해제 드롭 타깃이 된다.
 */
export function UnassignedSidebar({ unassigned }: UnassignedSidebarProps) {
  return (
    <aside
      data-testid="unassigned-sidebar"
      aria-label="미배치 참가자 목록"
      className="w-[260px] shrink-0 self-start sticky top-0 bg-gray-50 rounded-xl border border-gray-200 p-3 max-h-[calc(100vh-200px)] overflow-y-auto"
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
