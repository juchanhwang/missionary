'use client';

import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

import { useGetMissionGroups } from '../_hooks/useGetMissionGroups';

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

  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    return groups.filter((g) => {
      const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'ALL' || g.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [groups, search, filter]);

  const isCreatePage = pathname === '/missions/create';

  return (
    <aside className="flex flex-col w-[260px] shrink-0 bg-gray-10 border-r border-gray-30">
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <h3 className="text-sm font-bold text-gray-90">선교 그룹</h3>
        <Link
          href="/missions/create"
          className="flex items-center justify-center w-7 h-7 rounded-md border border-gray-30 bg-white text-gray-60 hover:bg-gray-20 hover:text-gray-80 transition-colors"
          aria-label="새 그룹 만들기"
        >
          <Plus size={14} />
        </Link>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-50"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="그룹 검색..."
            aria-label="그룹 검색"
            className="w-full h-8 pl-8 pr-3 rounded-md border border-gray-30 bg-white text-xs text-gray-90 placeholder:text-gray-50 focus:border-gray-40 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex mx-3 mb-2 p-0.5 rounded-md bg-gray-30">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setFilter(tab.value)}
            className={`flex-1 py-1 text-[11px] font-semibold rounded-[5px] transition-colors ${
              filter === tab.value
                ? 'bg-white text-gray-90 shadow-sm'
                : 'text-gray-50 hover:text-gray-70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-xs text-gray-50">
            불러오는 중...
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-xs text-gray-50">
            {search ? '검색 결과가 없습니다' : '등록된 그룹이 없습니다'}
          </div>
        ) : (
          filteredGroups.map((group) => {
            const isActive = activeGroupId === group.id && !isCreatePage;
            const count = group._count?.missionaries ?? 0;

            return (
              <Link
                key={group.id}
                href={`/missions/${group.id}`}
                className={`block rounded-lg px-3 py-2.5 mb-0.5 transition-all ${
                  isActive ? 'bg-white shadow-sm' : 'hover:bg-gray-20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[13px] font-semibold truncate ${
                      isActive ? 'text-gray-90' : 'text-gray-70'
                    }`}
                  >
                    {group.name}
                  </span>
                  {count > 0 && (
                    <span className="text-[11px] text-gray-50 bg-gray-20 px-1.5 py-px rounded-full ml-2 shrink-0">
                      {count}차
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-px rounded ${
                      group.type === 'ABROAD'
                        ? 'bg-blue-10 text-blue-60'
                        : 'bg-green-10 text-green-60'
                    }`}
                  >
                    {group.type === 'ABROAD' ? '해외' : '국내'}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}
