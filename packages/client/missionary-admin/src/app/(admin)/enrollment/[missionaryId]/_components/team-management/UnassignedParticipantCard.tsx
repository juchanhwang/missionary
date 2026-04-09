'use client';

import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';

import { getParticipationSubText } from './_utils/getParticipationSubText';

import type { DragData } from './types';
import type { Participation } from 'apis/participation';

interface UnassignedParticipantCardProps {
  participation: Participation;
}

/**
 * 미배치 참가자 카드. ui-spec §4-5.
 *
 * 사이드바의 `bg-gray-50` 배경 위에 놓이는 카드. 구조는 `TeamMemberCard`와 동일하지만
 * `useDraggable`에 `data.fromTeamId = null`을 넘겨 드래그 소스가 "미배치"임을 표시한다.
 */
export function UnassignedParticipantCard({
  participation,
}: UnassignedParticipantCardProps) {
  const subText = getParticipationSubText(participation);

  const dragData: DragData = {
    participationId: participation.id,
    fromTeamId: null,
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
      data-testid={`unassigned-card-${participation.id}`}
      aria-label={
        subText !== null
          ? `${participation.name}, ${subText}, 미배치 참가자 드래그 가능`
          : `${participation.name}, 미배치 참가자 드래그 가능`
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
