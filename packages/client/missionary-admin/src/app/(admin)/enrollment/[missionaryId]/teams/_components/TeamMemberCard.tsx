'use client';

import { useDraggable } from '@dnd-kit/core';
import { Crown, GripVertical } from 'lucide-react';

import { getParticipationSubText } from './_utils/getParticipationSubText';

import type { DragData } from './types';
import type { Participation } from 'apis/participation';

interface TeamMemberCardProps {
  participation: Participation;
  /**
   * 현재 팀의 팀장인지 여부. `TeamColumn`에서
   * `member.userId === team.leaderUserId`로 판정해 내려준다.
   * - `true`: 드래그 비활성화 + Crown 아이콘 + "팀장" 배지로 강조
   * - `false` (기본): 일반 멤버 카드
   */
  isLeader?: boolean;
}

/**
 * 팀 멤버 카드. ui-spec §4-4.
 *
 * 팀 컬럼 내부에 렌더되는 참가자 카드. 이름 + "{cohort}기 · {affiliation}" 서브텍스트.
 * 카드 전체가 드래그 소스(`useDraggable`). `data.fromTeamId = participation.teamId`로
 * KanbanBoard가 source-target 동일성을 판정할 수 있게 한다.
 *
 * **팀장 처리**: `isLeader`일 때 `useDraggable({ disabled: true })`로 드래그를 막고,
 * GripVertical → Crown 아이콘 교체 + 이름 옆 "팀장" 배지로 시각적으로 구분한다.
 * 팀장은 팀 고유 정체성이므로 임의 재배치를 방지한다 (팀 수정 모달을 통해서만 변경).
 *
 * UnassignedParticipantCard와 구조는 동일하지만 시맨틱/데이터가 달라 별도 컴포넌트로 유지.
 */
export function TeamMemberCard({
  participation,
  isLeader = false,
}: TeamMemberCardProps) {
  const subText = getParticipationSubText(participation);

  const dragData: DragData = {
    participationId: participation.id,
    fromTeamId: participation.teamId,
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `participation-${participation.id}`,
    data: dragData,
    disabled: isLeader,
  });

  const ariaLabel = buildAriaLabel(participation.name, subText, isLeader);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      data-testid={`team-member-card-${participation.id}`}
      aria-label={ariaLabel}
      className={`flex items-start gap-2 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 ${
        isLeader
          ? 'bg-blue-10/40 border border-blue-20 cursor-default'
          : 'bg-white border border-gray-200 cursor-grab active:cursor-grabbing'
      } ${isDragging ? 'opacity-30' : ''}`}
    >
      {isLeader ? (
        <Crown
          size={14}
          aria-hidden
          data-testid={`team-member-card-${participation.id}-leader-icon`}
          className="text-blue-60 mt-0.5 shrink-0"
        />
      ) : (
        <GripVertical
          size={14}
          aria-hidden
          className="text-gray-300 mt-0.5 shrink-0"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {participation.name}
          </p>
          {isLeader && (
            <span
              data-testid={`team-member-card-${participation.id}-leader-badge`}
              className="shrink-0 inline-flex items-center rounded bg-blue-20 text-blue-70 text-[10px] font-semibold px-1.5 py-0.5"
            >
              팀장
            </span>
          )}
        </div>
        {subText !== null && (
          <p className="text-xs text-gray-400 truncate">{subText}</p>
        )}
      </div>
    </div>
  );
}

/**
 * 스크린리더용 aria-label 조립.
 * - 일반 멤버: "{이름}[, {서브텍스트}], 팀 멤버 드래그 가능"
 * - 팀장:     "{이름}[, {서브텍스트}], 팀장, 드래그 불가"
 */
function buildAriaLabel(
  name: string,
  subText: string | null,
  isLeader: boolean,
): string {
  const parts = [name];
  if (subText !== null) parts.push(subText);
  if (isLeader) {
    parts.push('팀장', '드래그 불가');
  } else {
    parts.push('팀 멤버 드래그 가능');
  }
  return parts.join(', ');
}
