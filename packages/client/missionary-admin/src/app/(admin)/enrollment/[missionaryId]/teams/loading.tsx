import { TeamsLoadingSkeleton } from './_components/TeamsLoadingSkeleton';

export default function TeamsLoading() {
  return (
    <div className="flex flex-col flex-1 p-8 gap-5 min-h-0">
      {/* 헤더 스켈레톤 */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-3 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="h-7 w-48 animate-pulse rounded-lg bg-gray-100" />
      </div>

      <TeamsLoadingSkeleton />
    </div>
  );
}
