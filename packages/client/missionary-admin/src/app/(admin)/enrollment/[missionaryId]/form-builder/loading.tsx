export default function FormBuilderLoading() {
  return (
    <>
      {/* 스티키 툴바 스켈레톤 */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 bg-gray-100/95 backdrop-blur-sm border-b border-gray-200">
        <div className="flex flex-col gap-1">
          {/* 브레드크럼 */}
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          </div>
          {/* 제목 행 */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 animate-pulse rounded-md bg-gray-200" />
            <div className="h-7 w-32 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-[22px] w-20 animate-pulse rounded-md bg-gray-200" />
            <div className="h-[22px] w-16 animate-pulse rounded-md bg-gray-200" />
          </div>
        </div>
        {/* 액션 버튼 */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-8 w-14 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>

      {/* 폼 콘텐츠 스켈레톤 */}
      <div className="flex flex-col items-center px-8 py-8 pb-16">
        <div className="w-full max-w-2xl flex flex-col gap-3">
          {/* 폼 헤더 카드 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-clip">
            <div className="h-2 bg-red-600" />
            <div className="px-6 py-5">
              <div className="h-7 w-48 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-4 w-40 animate-pulse rounded bg-gray-100 mt-2" />
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="h-3.5 w-80 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          </div>

          {/* 고정 필드 카드 3개 (이름, 주민등록번호, 소속) */}
          {['이름', '주민등록번호', '소속'].map((label) => (
            <div
              key={label}
              className="rounded-xl border border-gray-200 bg-white px-5 py-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  {label}
                </span>
                <span className="text-red-600 font-bold text-sm">*</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  고정
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold border bg-gray-100 text-gray-400 border-gray-200">
                  TEXT
                </span>
              </div>
              <div className="h-9 w-full animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
            </div>
          ))}

          {/* 참석 일정 카드 */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex w-full items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">
                  참석 일정
                </span>
                <span className="text-red-600 font-bold text-sm">*</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  고정
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold border bg-blue-10 text-blue-60 border-blue-60">
                  SELECT
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-14 animate-pulse rounded bg-gray-100" />
                <div className="h-3.5 w-3.5 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-medium text-gray-400">
              커스텀 필드
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* 커스텀 필드 스켈레톤 2개 */}
          {Array.from({ length: 2 }, (_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white px-5 py-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-10 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
              <div className="h-9 w-full animate-pulse rounded-lg border border-gray-200 bg-gray-50" />
            </div>
          ))}

          {/* 필드 추가 버튼 스켈레톤 */}
          <div className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-white py-4">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </div>
    </>
  );
}
