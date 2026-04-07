'use client';

import { TeamColumnHeader } from './TeamColumnHeader';

import type { Participation } from 'apis/participation';
import type { Team } from 'apis/team';

interface TeamColumnProps {
  team: Team;
  members: Participation[];
}

/**
 * 단일 팀 컬럼. ui-spec §3-4, §4-3.
 *
 * W2-2 범위:
 * - 정적 레이아웃 (w-[220px] 고정)
 * - 팀 헤더 (TeamColumnHeader)
 * - 멤버 카드 placeholder (이름만) — W2-3에서 `TeamMemberCard`로 교체
 * - 멤버 0명일 때 드롭 힌트
 *
 * W3에서 헤더 메뉴 → 수정/삭제 모달 연결.
 * W4에서 `useDroppable({ id: 'team-{teamId}' })`로 드롭 타깃이 된다.
 */
export function TeamColumn({ team, members }: TeamColumnProps) {
  const memberCount = members.length;

  return (
    <div
      data-testid={`team-column-${team.id}`}
      role="group"
      aria-label={`${team.teamName} 드롭 영역`}
      className="w-[220px] shrink-0 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm min-h-[200px]"
    >
      <TeamColumnHeader team={team} memberCount={memberCount} />

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
        {memberCount === 0 ? (
          <EmptyMembersDropHint />
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              data-testid={`team-member-placeholder-${member.id}`}
              className="bg-white border border-gray-200 rounded-lg px-2.5 py-2"
            >
              <p className="text-sm font-semibold text-gray-900">
                {member.name}
              </p>
            </div>
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
