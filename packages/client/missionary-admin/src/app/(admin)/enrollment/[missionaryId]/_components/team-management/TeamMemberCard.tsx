'use client';

import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';

import { getParticipationSubText } from './_utils/getParticipationSubText';

import type { DragData } from './types';
import type { Participation } from 'apis/participation';

interface TeamMemberCardProps {
  participation: Participation;
}

/**
 * 팀 멤버 카드. ui-spec §4-4.
 *
 * 팀 컬럼 내부에 렌더되는 참가자 카드. 이름 + "{cohort}기 · {affiliation}" 서브텍스트.
 * 카드 전체가 드래그 소스(`useDraggable`). `data.fromTeamId = participation.teamId`로
 * KanbanBoard가 source-target 동일성을 판정할 수 있게 한다.
 *
 * UnassignedParticipantCard와 구조는 동일하지만 시맨틱/데이터가 달라 별도 컴포넌트로 유지.
 */
export function TeamMemberCard({ participation }: TeamMemberCardProps) {
  const subText = getParticipationSubText(participation);

  const dragData: DragData = {
    participationId: participation.id,
    fromTeamId: participation.teamId,
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `participation-${participation.id}`,
    data: dragData,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-testid={`team-member-card-${participation.id}`}
      aria-label={
        subText !== null
          ? `${participation.name}, ${subText}, 팀 멤버 드래그 가능`
          : `${participation.name}, 팀 멤버 드래그 가능`
      }
      className={`flex items-start gap-2 bg-white border border-gray-200 rounded-lg px-2.5 py-2 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-gray-400 ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
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
