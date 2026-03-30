export default function EnrollmentLoading() {
  return (
    <div className="flex flex-col flex-1 min-h-0 p-8 gap-6">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
      </div>

      {/* 카드 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl border border-gray-200 bg-gray-50"
          />
        ))}
      </div>

      {/* 테이블 스켈레톤 */}
      <div className="flex-1 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
    </div>
  );
}
