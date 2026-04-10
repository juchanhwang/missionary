'use client';

import { Button } from '@samilhero/design-system';
import { Plus } from 'lucide-react';

interface TeamManagementToolbarProps {
  teamCount: number;
  unassignedCount: number;
  onCreateTeam?: () => void;
}

/**
 * 팀 관리 탭 상단 툴바. ui-spec §4-1.
 *
 * 좌측: "팀 관리" 제목 + 팀 수 뱃지 + 미배치 수 뱃지
 * 우측: "팀 추가" 버튼 (W3에서 TeamCreateModal과 연결)
 *
 * 미배치 뱃지 색상:
 * - 0명: green (완료)
 * - 1명 이상: amber (주의)
 */
export function TeamManagementToolbar({
  teamCount,
  unassignedCount,
  onCreateTeam,
}: TeamManagementToolbarProps) {
  const unassignedBadgeClass =
    unassignedCount === 0
      ? 'bg-green-50 text-green-700'
      : 'bg-amber-50 text-amber-600';

  return (
    <div
      data-testid="team-management-toolbar"
      className="flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3">
        <h2 className="text-[15px] font-semibold text-gray-900">팀 관리</h2>
        <span
          data-testid="team-count-badge"
          className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500"
        >
          {teamCount}팀
        </span>
        <span className="text-xs text-gray-300">·</span>
        <span className="text-xs text-gray-500">미배치</span>
        <span
          data-testid="unassigned-count-badge"
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${unassignedBadgeClass}`}
        >
          {unassignedCount}명
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        color="neutral"
        size="sm"
        onClick={onCreateTeam}
        disabled={!onCreateTeam}
      >
        <Plus size={14} aria-hidden className="mr-1" />팀 추가
      </Button>
    </div>
  );
}
