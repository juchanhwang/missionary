export function EnrollmentDetailContentSkeleton() {
  return (
    <>
      {/* 요약 카드 스켈레톤 (3열) */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="h-3.5 w-12 animate-pulse rounded bg-gray-100 mb-2" />
                <div className="h-8 w-16 animate-pulse rounded-lg bg-gray-100" />
              </div>
              <div className="w-9 h-9 animate-pulse rounded-lg bg-gray-100" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="h-3 w-10 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="h-1.5 w-full animate-pulse rounded-full bg-gray-100" />
            </div>
          </div>
        ))}
      </div>

      {/* 테이블 스켈레톤 */}
      <div className="flex flex-col flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-clip">
        {/* 카드 헤더: 등록자 목록 + 툴바 */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-gray-200 min-h-[61px] gap-4">
          <div className="flex items-center gap-2">
            <div className="h-[22px] w-20 animate-pulse rounded bg-gray-100" />
            <div className="h-5 w-10 animate-pulse rounded-full bg-gray-100" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-[200px] animate-pulse rounded-lg bg-gray-100" />
            <div className="h-8 w-28 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-8 w-28 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-8 w-16 animate-pulse rounded-lg bg-gray-100" />
          </div>
        </div>

        {/* 테이블 헤더 */}
        <div className="flex items-center px-5 py-3 border-b border-gray-100 bg-gray-50 gap-4">
          {[140, 100, 110, 120, 110, 70, 90, 90].map((w, i) => (
            <div
              key={i}
              className="h-3.5 animate-pulse rounded bg-gray-200"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>

        {/* 테이블 행 */}
        <div className="flex-1 min-h-0">
          {Array.from({ length: 10 }, (_, rowIdx) => (
            <div
              key={rowIdx}
              className="flex items-center px-5 py-3.5 border-b border-gray-50 gap-4"
            >
              <div className="h-4 w-[140px] animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-[100px] animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-[110px] animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-[120px] animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-[110px] animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-[70px] animate-pulse rounded bg-gray-100" />
              <div className="h-5 w-[90px] animate-pulse rounded-full bg-gray-100" />
              <div className="h-4 w-[90px] animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>

        {/* 페이지네이션 푸터 */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
          <div className="h-3.5 w-32 animate-pulse rounded bg-gray-100" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="h-8 w-8 animate-pulse rounded-lg bg-gray-100"
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
