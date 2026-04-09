'use client';

import { Users } from 'lucide-react';

interface TeamsEmptyStateProps {
  /** 클릭 시 팀 생성 모달을 연다. 미지정 시 버튼은 렌더되지 않는다. */
  onCreateTeam?: () => void;
}

/**
 * 팀이 0개일 때 표시되는 Empty State. ui-spec §6-1.
 *
 * 검색/필터로 인한 빈 결과는 `TeamFilterEmptyState`가 담당한다.
 * 두 컴포넌트는 서로 다른 빈 상태(데이터 없음 vs 필터 결과 없음)를 표현하므로 분리한다.
 */
export function TeamsEmptyState({ onCreateTeam }: TeamsEmptyStateProps) {
  return (
    <div
      data-testid="teams-empty-state"
      className="flex flex-1 flex-col items-center justify-center gap-2 min-h-[400px] text-center"
    >
      <Users size={36} className="text-gray-300" aria-hidden />
      <p className="text-sm font-semibold text-gray-700">팀이 아직 없습니다</p>
      <p className="text-xs text-gray-400">
        상단 &ldquo;팀 추가&rdquo; 버튼으로 첫 팀을 만들어보세요
      </p>
      {onCreateTeam && (
        <button
          type="button"
          onClick={onCreateTeam}
          data-testid="teams-empty-create-button"
          className="mt-2 inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          팀 추가
        </button>
      )}
    </div>
  );
}
