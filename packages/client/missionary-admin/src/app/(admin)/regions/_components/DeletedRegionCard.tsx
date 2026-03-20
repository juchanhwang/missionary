'use client';

import { overlay, Pagination } from '@samilhero/design-system';
import { ChevronDown, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { DeletedRegionTable } from './DeletedRegionTable';
import { MissionaryRegionFilters } from './MissionaryRegionFilters';
import { useGetDeletedRegions } from '../_hooks/useGetDeletedRegions';
import { ITEMS_PER_PAGE } from '../_hooks/useRegionFilterParams';
import { RestoreRegionModal } from './modal/RestoreRegionModal';

import type { DeletedRegionListItem } from 'apis/missionaryRegion';

export function DeletedRegionCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [missionGroupId, setMissionGroupId] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetDeletedRegions({
    missionGroupId: missionGroupId || undefined,
    query: query || undefined,
    page,
  });

  const regions = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const hasData = !isLoading && regions.length > 0;

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const handleMissionGroupChange = (value: string) => {
    setMissionGroupId(value);
    setPage(1);
  };

  const handleRestore = (region: DeletedRegionListItem) => {
    overlay.openAsync<boolean>(({ isOpen: modalOpen, close, unmount }) => (
      <RestoreRegionModal
        isOpen={modalOpen}
        close={(result) => {
          close(result);
          setTimeout(unmount, 300);
        }}
        region={region}
      />
    ));
  };

  return (
    <div className="shrink-0 bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Collapsible 헤더 */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-gray-50 ${isOpen ? 'border-b border-gray-200' : ''}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <Trash2 size={14} />
          </div>
          <span className="text-sm font-semibold text-gray-700">
            삭제된 연계지
          </span>
          {total > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
              {total}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {isOpen ? '클릭하여 목록 숨기기' : '클릭하여 목록 보기'}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Collapsible 패널 */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          {/* 카드 내부 필터 */}
          <MissionaryRegionFilters
            query={query}
            missionGroupId={missionGroupId}
            onQueryChange={handleQueryChange}
            onMissionGroupChange={handleMissionGroupChange}
            searchLabel="삭제된 연계지 검색"
          />

          {/* 테이블 */}
          <DeletedRegionTable
            regions={regions}
            isLoading={isLoading}
            onRestore={handleRestore}
          />

          {/* 페이지네이션 */}
          {hasData && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {total > 0
                  ? `${(page - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(page * ITEMS_PER_PAGE, total)} / 전체 ${total}건`
                  : '0건'}
              </p>
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
