'use client';

import { Button, overlay, Pagination } from '@samilhero/design-system';
import { useAuth } from 'lib/auth/AuthContext';
import { Plus } from 'lucide-react';

import { DeletedRegionCard } from './DeletedRegionCard';
import { MissionaryRegionEmptyState } from './MissionaryRegionEmptyState';
import { MissionaryRegionFilters } from './MissionaryRegionFilters';
import { MissionaryRegionTable } from './MissionaryRegionTable';
import { useGetMissionaryRegions } from '../_hooks/useGetMissionaryRegions';
import {
  ITEMS_PER_PAGE,
  useRegionFilterParams,
} from '../_hooks/useRegionFilterParams';
import { DeleteMissionaryRegionModal } from './modal/DeleteMissionaryRegionModal';
import { MissionaryRegionFormModal } from './modal/MissionaryRegionFormModal';

import type { RegionListItem } from 'apis/missionaryRegion';

export function MissionaryRegionsPageClient() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const { params, setQuery, setMissionGroupId, setPage, clearQuery } =
    useRegionFilterParams();

  const { data, isLoading, isError, refetch } = useGetMissionaryRegions({
    missionGroupId: params.missionGroupId || undefined,
    query: params.query || undefined,
    page: params.page,
  });

  const regions = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = params.page;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const handleCreateClick = () => {
    overlay.openAsync<boolean>(({ isOpen, close, unmount }) => (
      <MissionaryRegionFormModal
        mode="create"
        isOpen={isOpen}
        close={(result) => {
          close(result);
          setTimeout(unmount, 300);
        }}
        defaultMissionGroupId={params.missionGroupId || undefined}
      />
    ));
  };

  const handleEdit = (region: RegionListItem) => {
    overlay.openAsync<boolean>(({ isOpen, close, unmount }) => (
      <MissionaryRegionFormModal
        mode="edit"
        isOpen={isOpen}
        close={(result) => {
          close(result);
          setTimeout(unmount, 300);
        }}
        region={region}
      />
    ));
  };

  const handleDelete = (region: RegionListItem) => {
    overlay.openAsync<boolean>(({ isOpen, close, unmount }) => (
      <DeleteMissionaryRegionModal
        isOpen={isOpen}
        close={(result) => {
          close(result);
          setTimeout(unmount, 300);
        }}
        region={region}
      />
    ));
  };

  const hasData = !isLoading && !isError && regions.length > 0;
  const isEmpty = !isLoading && !isError && regions.length === 0;
  const emptyType =
    params.query || params.missionGroupId ? 'no-results' : 'empty';

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0">
      <div className="flex flex-col flex-1 p-8 min-h-0 gap-4 overflow-y-auto">
        {/* 활성 연계지 카드 */}
        <div className="shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* 카드 헤더 */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
            <p className="text-[15px] font-semibold text-gray-900 flex items-center gap-2">
              연계지 목록
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {total}
              </span>
            </p>
            {isAdmin && (
              <Button
                variant="filled"
                color="primary"
                size="sm"
                onClick={handleCreateClick}
              >
                <Plus size={13} />
                연계지 등록
              </Button>
            )}
          </div>

          {/* 카드 내부 필터 */}
          <MissionaryRegionFilters
            query={params.query}
            missionGroupId={params.missionGroupId}
            onQueryChange={setQuery}
            onMissionGroupChange={setMissionGroupId}
          />

          {/* 콘텐츠 */}
          {isError ? (
            <MissionaryRegionEmptyState
              type="error"
              onRetry={() => refetch()}
            />
          ) : isEmpty ? (
            <MissionaryRegionEmptyState
              type={emptyType}
              query={params.query}
              isAdmin={isAdmin}
              onClearSearch={clearQuery}
              onCreateClick={handleCreateClick}
            />
          ) : (
            <MissionaryRegionTable
              regions={regions}
              isLoading={isLoading}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          {/* 페이지네이션 */}
          {hasData && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {total > 0
                  ? `${(currentPage - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(currentPage * ITEMS_PER_PAGE, total)} / 전체 ${total}건`
                  : '0건'}
              </p>
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
        </div>

        {/* 삭제된 연계지 카드 */}
        {isAdmin && <DeletedRegionCard />}
      </div>
    </div>
  );
}
