'use client';

/**
 * 팀 목록/참가자 조회 로딩 스켈레톤. ui-spec §6-4.
 * 좌측 미배치 사이드바 placeholder + 우측 팀 컬럼 3개 placeholder.
 *
 * `TeamManagementSection`의 `isLoading` 분기에서 표시된다.
 */
export function TeamsLoadingSkeleton() {
  return (
    <div
      data-testid="team-management-loading"
      className="flex flex-row flex-1 gap-4 p-4 min-h-[560px]"
    >
      <div
        aria-hidden
        className="w-[260px] shrink-0 animate-pulse bg-gray-100 rounded-xl"
      />
      <div className="flex flex-1 flex-wrap gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            aria-hidden
            className="w-[220px] h-[300px] animate-pulse bg-gray-100 rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}
