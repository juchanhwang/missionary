'use client';

import { Ellipsis } from 'lucide-react';

import type { Team } from 'apis/team';

interface TeamColumnHeaderProps {
  team: Team;
  memberCount: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * 팀 컬럼 헤더. ui-spec §4-3.
 *
 * 표시:
 * - 팀명 + 인원 수
 * - 팀장명 · 연계지명
 * - 메뉴 버튼 (Ellipsis) → W3에서 수정/삭제 드롭다운 메뉴 연결
 *
 * W2-2 범위: 정적 표시만. 메뉴 버튼은 disabled placeholder.
 */
export function TeamColumnHeader({
  team,
  memberCount,
  onEdit,
  onDelete,
}: TeamColumnHeaderProps) {
  const regionName = team.missionaryRegion?.name ?? null;
  const subText =
    regionName !== null
      ? `${team.leaderUserName} · ${regionName}`
      : team.leaderUserName;

  return (
    <header className="flex items-start justify-between gap-2 px-3 pt-3 pb-2 border-b border-gray-100">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[13px] font-semibold text-gray-900 truncate">
            {team.teamName}
          </h3>
          <span
            data-testid={`team-member-count-${team.id}`}
            className="text-xs font-semibold text-gray-500"
          >
            {memberCount}명
          </span>
        </div>
        <p className="text-[11px] text-gray-400 truncate mt-0.5">{subText}</p>
      </div>

      <button
        type="button"
        aria-label={`${team.teamName} 메뉴`}
        data-testid={`team-column-menu-${team.id}`}
        disabled={!onEdit && !onDelete}
        onClick={() => {
          // W3에서 수정/삭제 드롭다운 메뉴 오픈
          onEdit?.();
          onDelete?.();
        }}
        className="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Ellipsis size={16} aria-hidden />
      </button>
    </header>
  );
}
