import { AsyncBoundary } from 'components/boundary';

import { MissionGroupDetail } from './_components/MissionGroupDetail';

export default function MissionGroupDetailPage() {
  return (
    <AsyncBoundary
      pendingFallback={
        <div className="flex items-center justify-center flex-1">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-gray-30 border-t-gray-60 rounded-full animate-spin" />
            <p className="text-sm text-gray-50">불러오는 중...</p>
          </div>
        </div>
      }
    >
      <MissionGroupDetail />
    </AsyncBoundary>
  );
}
