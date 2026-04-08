'use client';

import { TeamColumnHeader } from './TeamColumnHeader';
import { TeamMemberCard } from './TeamMemberCard';

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
 * W2-2 범위: 정적 레이아웃 (w-[220px] 고정) + 팀 헤더 + 멤버 카드.
 * W3: 헤더 메뉴 → 수정/삭제 모달 콜백 연결.
 * W4: `useDroppable({ id: 'team-{teamId}' })`로 드롭 타깃이 된다.
 */
export function TeamColumn({
  team,
  members,
  onEdit,
  onDelete,
}: TeamColumnProps) {
  const memberCount = members.length;

  return (
    <div
      data-testid={`team-column-${team.id}`}
      role="group"
      aria-label={`${team.teamName} 드롭 영역`}
      className="w-[220px] shrink-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm min-h-[200px]"
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
