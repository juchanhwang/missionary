'use client';

import { TeamColumnMenu } from './TeamColumnMenu';

import type { Team } from 'apis/team';

interface TeamColumnHeaderProps {
  team: Team;
  memberCount: number;
  /**
   * 호버 시 드롭 후 인원 수 미리보기. ui-spec §5-4, mockup Screen 6-B.
   * `undefined` 또는 `memberCount`와 같으면 미리보기를 표시하지 않는다
   * (같은 팀 내 재배치 시 깜박임 방지).
   */
  previewCount?: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * 팀 컬럼 헤더. ui-spec §4-3, mockup Screen 2.
 *
 * 표시 책임만 담당:
 * - 팀명 + 인원 수 (호버 시 미리보기 카운트로 전환)
 * - 팀장명 · 연계지명
 *
 * 메뉴 인터랙션(드롭다운 열림/닫힘 + outside click/Esc 처리)은
 * `TeamColumnMenu`로 분리되어 있다.
 */
export function TeamColumnHeader({
  team,
  memberCount,
  previewCount,
  onEdit,
  onDelete,
}: TeamColumnHeaderProps) {
  const regionName = team.missionaryRegion?.name ?? null;
  const subText =
    regionName !== null
      ? `${team.leaderUserName} · ${regionName}`
      : team.leaderUserName;

  const showPreview =
    previewCount !== undefined && previewCount !== memberCount;

  return (
    <header className="flex items-start justify-between gap-2 px-3 pt-3 pb-2 border-b border-gray-100">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[13px] font-semibold text-gray-900 truncate">
            {team.teamName}
          </h3>
          {showPreview ? (
            <span
              data-testid={`team-member-count-preview-${team.id}`}
              className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700"
            >
              {memberCount} → {previewCount}명
            </span>
          ) : (
            <span
              data-testid={`team-member-count-${team.id}`}
              className="text-xs font-semibold text-gray-500"
            >
              {memberCount}명
            </span>
          )}
        </div>
        <p className="text-[11px] text-gray-400 truncate mt-0.5">{subText}</p>
      </div>

      <TeamColumnMenu team={team} onEdit={onEdit} onDelete={onDelete} />
    </header>
  );
}
