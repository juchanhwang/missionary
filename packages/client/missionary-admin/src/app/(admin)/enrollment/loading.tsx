export default function EnrollmentLoading() {
  return (
    <div className="flex flex-col flex-1 min-h-0 p-8 gap-6">
      {/* 요약 통계 스켈레톤 */}
      <div className="flex justify-end">
        <div className="h-5 w-48 animate-pulse rounded bg-gray-100" />
      </div>

      {/* 마감 임박 카드 섹션 스켈레톤 */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-clip"
            >
              {/* 컬러 바 */}
              <div className="h-1 animate-pulse bg-gray-200" />

              <div className="p-5">
                {/* Badge + D-day */}
                <div className="flex items-center justify-between mb-3">
                  <div className="h-5 w-10 animate-pulse rounded-full bg-gray-100" />
                  <div className="h-5 w-12 animate-pulse rounded-md bg-gray-100" />
                </div>

                {/* 선교명 */}
                <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 mb-4" />

                {/* 선교 기간 */}
                <div className="h-3.5 w-40 animate-pulse rounded bg-gray-100 mb-1" />

                {/* 신청 마감 */}
                <div className="h-3.5 w-36 animate-pulse rounded bg-gray-100 mb-4" />

                {/* 신청 현황 */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-14 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
                  </div>
                  <div className="h-1.5 animate-pulse rounded-full bg-gray-100" />
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-8 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              </div>

              {/* 하단 푸터 */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-14 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 테이블 섹션 스켈레톤 */}
      <div className="flex flex-col flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-clip">
        {/* 섹션 헤더 */}
        <div className="shrink-0 flex items-center gap-2 px-5 py-3.5 border-b border-gray-200">
          <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-8 animate-pulse rounded-full bg-gray-100" />
        </div>

        {/* 필터 툴바 */}
        <div className="shrink-0 flex items-center gap-2.5 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
          <div className="h-8 w-[280px] animate-pulse rounded-md bg-gray-200" />
          <div className="w-px h-[18px] bg-gray-200" />
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-7 w-16 animate-pulse rounded-full bg-gray-200"
              />
            ))}
          </div>
        </div>

        {/* 테이블 */}
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left">
                  <div className="h-3.5 w-12 animate-pulse rounded bg-gray-200" />
                </th>
                <th className="px-4 py-3 text-left w-20">
                  <div className="h-3.5 w-14 animate-pulse rounded bg-gray-200" />
                </th>
                <th className="px-4 py-3 text-left w-36">
                  <div className="h-3.5 w-16 animate-pulse rounded bg-gray-200" />
                </th>
                <th className="px-4 py-3 text-left w-28">
                  <div className="h-3.5 w-20 animate-pulse rounded bg-gray-200" />
                </th>
                <th className="px-4 py-3 text-left w-32">
                  <div className="h-3.5 w-10 animate-pulse rounded bg-gray-200" />
                </th>
                <th className="px-4 py-3 text-left w-20">
                  <div className="h-3.5 w-14 animate-pulse rounded bg-gray-200" />
                </th>
                <th className="px-4 py-3 text-left w-24">
                  <div className="h-3.5 w-10 animate-pulse rounded bg-gray-200" />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-4 py-3.5">
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-5 w-10 animate-pulse rounded-full bg-gray-100" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-3.5 w-28 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 animate-pulse rounded-full bg-gray-100" />
                      <div className="h-3 w-8 animate-pulse rounded bg-gray-100" />
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-4 w-10 animate-pulse rounded bg-gray-100" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="h-5 w-14 animate-pulse rounded-full bg-gray-100" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
          <div className="h-3.5 w-32 animate-pulse rounded bg-gray-100" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-7 w-7 animate-pulse rounded bg-gray-100"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
