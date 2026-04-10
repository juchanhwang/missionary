import { TeamsLoadingSkeleton } from './_components/TeamsLoadingSkeleton';

export default function TeamsLoading() {
  return (
    <div className="flex flex-col flex-1 p-8 gap-5 min-h-0">
      {/* 헤더 스켈레톤 — TeamManagementHeader */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-3 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-7 w-48 animate-pulse rounded-lg bg-gray-100" />
      </div>

      <div className="flex flex-col flex-1 min-h-0 gap-4">
        {/* 툴바 스켈레톤 — TeamManagementToolbar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-5 w-14 animate-pulse rounded bg-gray-100" />
            <div className="h-5 w-10 animate-pulse rounded-full bg-gray-100" />
            <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-100" />
        </div>

        {/* 필터바 스켈레톤 — TeamFilterBar */}
        <div className="flex flex-row flex-wrap items-end gap-2">
          <div className="h-9 min-w-[200px] max-w-[320px] flex-1 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-9 w-[200px] animate-pulse rounded-lg bg-gray-100" />
          <div className="h-9 w-16 animate-pulse rounded-lg bg-gray-100" />
        </div>

        <TeamsLoadingSkeleton />
      </div>
    </div>
  );
}
