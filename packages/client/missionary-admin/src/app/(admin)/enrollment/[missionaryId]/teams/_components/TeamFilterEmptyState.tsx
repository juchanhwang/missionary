'use client';

interface TeamFilterEmptyStateProps {
  onResetFilter?: () => void;
}

/**
 * 검색/필터 결과가 없을 때 팀 컬럼 영역에 렌더되는 안내. fe-plan §6-3.
 *
 * `TeamManagementSection`에서 `filteredTeams.length === 0`일 때
 * `KanbanBoard`의 `columns` 슬롯 대신 이 컴포넌트를 주입한다.
 * 좌측 미배치 사이드바는 그대로 유지된다.
 */
export function TeamFilterEmptyState({
  onResetFilter,
}: TeamFilterEmptyStateProps) {
  return (
    <div
      data-testid="team-filter-empty-state"
      role="status"
      className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-gray-500"
    >
      <p>조건에 맞는 팀이 없습니다.</p>
      {onResetFilter && (
        <button
          type="button"
          onClick={onResetFilter}
          data-testid="team-filter-empty-reset"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          필터 초기화
        </button>
      )}
    </div>
  );
}
