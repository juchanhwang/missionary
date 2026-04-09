'use client';

import { Chips, SearchBox } from '@samilhero/design-system';
import { LoadingSpinner } from 'components/loading';
import { useGetMissionGroups } from 'hooks/missionGroup';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useState } from 'react';

import { CategoryBadge } from './CategoryBadge';

type GroupFilter = 'ALL' | 'DOMESTIC' | 'ABROAD';

const FILTER_TABS: { label: string; value: GroupFilter }[] = [
  { label: '전체', value: 'ALL' },
  { label: '국내', value: 'DOMESTIC' },
  { label: '해외', value: 'ABROAD' },
];

export function GroupPanel() {
  const { data: groups, isLoading } = useGetMissionGroups();
  const params = useParams();
  const pathname = usePathname();
  const activeGroupId = params.groupId as string | undefined;

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<GroupFilter>('ALL');

  const filteredGroups = groups
    ? groups.filter((g) => {
        const matchesSearch = g.name
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesFilter = filter === 'ALL' || g.category === filter;
        return matchesSearch && matchesFilter;
      })
    : [];

  const isCreatePage = pathname === '/missions/create';

  const handleFilterKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setFilter(FILTER_TABS[(currentIndex + 1) % FILTER_TABS.length].value);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setFilter(
        FILTER_TABS[
          (currentIndex - 1 + FILTER_TABS.length) % FILTER_TABS.length
        ].value,
      );
    }
  };

  return (
    <aside className="flex flex-col w-[260px] shrink-0 bg-white border-r border-gray-200">
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <h3 className="text-sm font-bold text-gray-900">선교 그룹</h3>
        <Link
          href="/missions/create"
          className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          aria-label="새 그룹 만들기"
        >
          <Plus size={14} />
        </Link>
      </div>

      <div className="px-3 pb-2">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="그룹 검색..."
          size="sm"
        />
      </div>

      <div
        role="radiogroup"
        aria-label="선교 그룹 유형 필터"
        className="flex gap-1.5 mx-3 mb-2"
      >
        {FILTER_TABS.map((tab, index) => (
          <button
            key={tab.value}
            type="button"
            role="radio"
            aria-checked={filter === tab.value}
            tabIndex={filter === tab.value ? 0 : -1}
            onClick={() => setFilter(tab.value)}
            onKeyDown={(e) => handleFilterKeyDown(e, index)}
            className="bg-transparent border-none p-0 cursor-pointer"
          >
            <Chips
              variant={filter === tab.value ? 'accent' : 'default'}
              size="sm"
            >
              {tab.label}
            </Chips>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {isLoading ? (
          <LoadingSpinner />
        ) : filteredGroups.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-xs text-gray-400">
            {search ? '검색 결과가 없습니다' : '등록된 그룹이 없습니다'}
          </div>
        ) : (
          filteredGroups.map((group) => {
            const isActive = activeGroupId === group.id && !isCreatePage;
            return (
              <Link
                key={group.id}
                href={`/missions/${group.id}`}
                className={`block rounded-lg px-3 py-2.5 mb-0.5 transition-all ${
                  isActive ? 'bg-white shadow-sm' : 'hover:bg-gray-100'
                }`}
              >
                <span
                  className={`text-[13px] font-semibold truncate mb-1 block ${
                    isActive ? 'text-gray-900' : 'text-gray-700'
                  }`}
                >
                  {group.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <CategoryBadge category={group.category} />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}
