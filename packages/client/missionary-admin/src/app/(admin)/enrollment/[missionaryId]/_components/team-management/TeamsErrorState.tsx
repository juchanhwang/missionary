'use client';

interface TeamsErrorStateProps {
  /** 팀+참가자 두 쿼리를 동시에 refetch한다. 미지정 시 버튼은 렌더되지 않는다. */
  onRetry?: () => void;
}

/**
 * 팀 또는 참가자 조회 실패 시 표시되는 인라인 에러 알림.
 *
 * 패키지 전역 `error.tsx` 경계와는 별개로, 데이터 패칭 실패만 잡아 사용자가
 * 페이지를 떠나지 않고 재시도할 수 있게 한다.
 */
export function TeamsErrorState({ onRetry }: TeamsErrorStateProps) {
  return (
    <div
      data-testid="team-management-error"
      role="alert"
      className="flex flex-1 flex-col items-center justify-center gap-3 min-h-[400px] text-sm text-gray-500"
    >
      <p>팀 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          data-testid="team-management-error-retry"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
