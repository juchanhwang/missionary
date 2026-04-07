'use client';

import { GripVertical } from 'lucide-react';

import { getParticipationSubText } from './_utils/getParticipationSubText';

import type { Participation } from 'apis/participation';

interface TeamMemberCardProps {
  participation: Participation;
}

/**
 * 팀 멤버 카드. ui-spec §4-4.
 *
 * 팀 컬럼 내부에 렌더되는 참가자 카드. 이름 + "{cohort}기 · {affiliation}" 서브텍스트.
 * GripVertical 아이콘은 드래그 핸들 시각 표시 용도 (W4에서 dnd-kit과 연결).
 *
 * UnassignedParticipantCard와 구조는 동일하지만 의미가 달라 별도 컴포넌트로 유지:
 * - 배치 컨텍스트 / 미배치 컨텍스트 구분
 * - W4에서 각자 `useDraggable({ data: { fromTeamId } })`에 다른 `fromTeamId`를 넘긴다
 */
export function TeamMemberCard({ participation }: TeamMemberCardProps) {
  const subText = getParticipationSubText(participation);

  return (
    <div
      data-testid={`team-member-card-${participation.id}`}
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
