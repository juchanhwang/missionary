'use client';

import { GripVertical } from 'lucide-react';

import { getParticipationSubText } from './_utils/getParticipationSubText';

import type { Participation } from 'apis/participation';

interface UnassignedParticipantCardProps {
  participation: Participation;
}

/**
 * 미배치 참가자 카드. ui-spec §4-5.
 *
 * 사이드바의 `bg-gray-50` 배경 위에 놓이는 카드. 구조는 `TeamMemberCard`와 동일하지만
 * W4에서 `useDraggable({ data: { fromTeamId: null } })`로 드래그 소스 컨텍스트가 다르다.
 *
 * 카드 내부 "팀 선택" Select는 W3에서 추가한다 (키보드 a11y 대안).
 */
export function UnassignedParticipantCard({
  participation,
}: UnassignedParticipantCardProps) {
  const subText = getParticipationSubText(participation);

  return (
    <div
      data-testid={`unassigned-card-${participation.id}`}
      className="flex items-start gap-2 bg-white border border-gray-200 rounded-lg px-2.5 py-2"
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
