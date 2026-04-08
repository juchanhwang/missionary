'use client';

import { useDroppable } from '@dnd-kit/core';

import { TeamColumnHeader } from './TeamColumnHeader';
import { TeamMemberCard } from './TeamMemberCard';

import type { DropData } from './types';
import type { Participation } from 'apis/participation';
import type { Team } from 'apis/team';

interface TeamColumnProps {
  team: Team;
  members: Participation[];
  onEdit?: (team: Team) => void;
  onDelete?: (team: Team, memberCount: number) => void;
}

/**
 * 단일 팀 컬럼. ui-spec §3-4, §4-3.
 *
 * - `useDroppable({ id: 'team-{teamId}' })`로 드롭 타깃이 된다.
 * - 헤더 메뉴에서 수정/삭제 모달을 호출한다 (W3-4).
 * - `isOver`일 때 파란 테두리 하이라이트.
 */
export function TeamColumn({
  team,
  members,
  onEdit,
  onDelete,
}: TeamColumnProps) {
  const memberCount = members.length;

  const dropData: DropData = { type: 'team', teamId: team.id };
  const { setNodeRef, isOver } = useDroppable({
    id: `team-${team.id}`,
    data: dropData,
  });

  return (
    <div
      ref={setNodeRef}
      data-testid={`team-column-${team.id}`}
      role="group"
      aria-label={`${team.teamName} 드롭 영역`}
      className={`w-[220px] shrink-0 flex flex-col bg-white rounded-xl border shadow-sm min-h-[200px] transition-colors ${
        isOver ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200'
      }`}
    >
      <TeamColumnHeader
        team={team}
        memberCount={memberCount}
        onEdit={onEdit ? () => onEdit(team) : undefined}
        onDelete={onDelete ? () => onDelete(team, memberCount) : undefined}
      />

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
        {memberCount === 0 ? (
          <EmptyMembersDropHint />
        ) : (
          members.map((member) => (
            <TeamMemberCard key={member.id} participation={member} />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * 멤버 0명 드롭 힌트. ui-spec §6-2.
 */
function EmptyMembersDropHint() {
  return (
    <div
      data-testid="empty-members-drop-hint"
      className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-300 text-center py-6 m-2"
    >
      참가자를 드래그하여
      <br />이 팀에 배치하세요
    </div>
  );
}
