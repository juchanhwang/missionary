export default function EnrollmentDetailLoading() {
  return (
    <div className="flex flex-col flex-1 min-h-0 p-8 gap-5">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-7 w-48 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
      </div>

      {/* 요약 카드 스켈레톤 */}
      <div className="h-24 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />

      {/* 도구 모음 스켈레톤 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-100" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-lg bg-gray-100" />
      </div>

      {/* 테이블 스켈레톤 */}
      <div className="flex-1 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
    </div>
  );
}
