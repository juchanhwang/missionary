'use client';

import { GripVertical } from 'lucide-react';

import { getParticipationSubText } from './_utils/getParticipationSubText';

import type { Participation } from 'apis/participation';

interface GhostMemberCardProps {
  participation: Participation;
}

/**
 * 팀 컬럼 호버 시 드롭 위치를 미리 보여주는 ghost 카드. ui-spec §4-7, mockup Screen 6-B.
 *
 * - 비-인터랙티브 placeholder (`useDraggable` 없음, 클릭/포커스 안 됨)
 * - 시각 토큰: `border border-dashed border-blue-400 bg-blue-50/60 opacity-70`
 * - 스크린리더 중복 알림 방지를 위해 `aria-hidden`. 드롭 결과는 `KanbanBoard`의
 *   `aria-live` 안내(§7-1)에서 별도로 전달된다.
 *
 * `TeamColumn`에서 활성 드래그 + 호버 상태일 때만 멤버 리스트 끝에 렌더한다.
 */
export function GhostMemberCard({ participation }: GhostMemberCardProps) {
  const subText = getParticipationSubText(participation);

  return (
    <div
      data-testid={`ghost-member-card-${participation.id}`}
      aria-hidden
      className="flex items-start gap-2 border border-dashed border-blue-400 bg-blue-50/60 rounded-lg px-2.5 py-2 opacity-70"
    >
      <GripVertical
        size={14}
        aria-hidden
        className="text-blue-300 mt-0.5 shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-blue-700 truncate">
          {participation.name}
        </p>
        {subText !== null && (
          <p className="text-xs text-blue-400 truncate">{subText}</p>
        )}
      </div>
    </div>
  );
}
