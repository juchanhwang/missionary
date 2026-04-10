'use client';

import { Plus } from 'lucide-react';

interface NewTeamGhostColumnProps {
  onClick?: () => void;
}

/**
 * "+ 새 팀" Ghost 컬럼. ui-spec §3-5.
 *
 * 점선 테두리의 빈 컬럼. 클릭 시 TeamCreateModal을 오픈한다(W3에서 연결).
 * W2-4 범위: 정적 렌더 + 콜백 호출. 콜백이 없으면 disabled 상태.
 */
export function NewTeamGhostColumn({ onClick }: NewTeamGhostColumnProps) {
  return (
    <button
      type="button"
      data-testid="new-team-ghost-column"
      onClick={onClick}
      disabled={!onClick}
      className="w-[220px] shrink-0 min-h-[200px] flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 rounded-xl text-gray-300 hover:border-gray-300 hover:text-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      <Plus size={20} aria-hidden />
      <span className="text-sm font-medium">새 팀</span>
    </button>
  );
}
