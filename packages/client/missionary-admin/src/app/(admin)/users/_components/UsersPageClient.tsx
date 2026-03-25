'use client';

import { Pagination } from '@samilhero/design-system';
import {
  type AuthProvider,
  type GetUsersParams,
  type PaginatedUsersResponse,
  type UserRole,
  type UserSearchType,
} from 'apis/user';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { useGetUsers } from '../_hooks/useGetUsers';
import { UserEditPanel } from './panel/UserEditPanel';
import { UserSearchFilter } from './UserSearchFilter';
import { UserTable } from './UserTable';

const PAGE_SIZE = 20;

interface UsersPageClientProps {
  initialData: PaginatedUsersResponse;
}

export function UsersPageClient({ initialData }: UsersPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get('userId');
  const [mountedUserId, setMountedUserId] = useState<string | null>(null);

  // 새 유저 선택 시 패널 마운트 (렌더 중 파생 상태)
  if (selectedUserId && selectedUserId !== mountedUserId) {
    setMountedUserId(selectedUserId);
  }

  const handlePanelExited = () => {
    setMountedUserId(null);
  };

  const [filterParams, setFilterParams] = useState<GetUsersParams>({
    page: 1,
    pageSize: PAGE_SIZE,
    searchType: 'name',
    keyword: '',
    role: '',
    provider: '',
    isBaptized: '',
  });

  const { data, isLoading, isError, refetch } = useGetUsers({
    params: filterParams,
    initialData,
  });

  const users = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? filterParams.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSearchTypeChange = (searchType: UserSearchType) => {
    setFilterParams((prev) => ({ ...prev, searchType, keyword: '', page: 1 }));
  };

  const handleKeywordChange = (keyword: string) => {
    setFilterParams((prev) => ({ ...prev, keyword, page: 1 }));
  };

  const handleRoleChange = (role: UserRole | '') => {
    setFilterParams((prev) => ({ ...prev, role, page: 1 }));
  };

  const handleProviderChange = (provider: AuthProvider | '') => {
    setFilterParams((prev) => ({ ...prev, provider, page: 1 }));
  };

  const handleBaptizedChange = (isBaptized: string) => {
    setFilterParams((prev) => ({ ...prev, isBaptized, page: 1 }));
  };

  const handleRowClick = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('userId', id);
    router.push(`/users?${params.toString()}`);
  };

  const handlePanelClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('userId');
    const queryString = params.toString();
    router.push(queryString ? `/users?${queryString}` : '/users');
  };

  const handlePageChange = (page: number) => {
    setFilterParams((prev) => ({ ...prev, page }));
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0">
      <div className="flex flex-col flex-1 p-8 min-h-0">
        <div className="shrink-0">
          <UserSearchFilter
            searchType={filterParams.searchType || 'name'}
            keyword={filterParams.keyword ?? ''}
            role={filterParams.role ?? ''}
            provider={filterParams.provider ?? ''}
            isBaptized={filterParams.isBaptized ?? ''}
            onSearchTypeChange={handleSearchTypeChange}
            onKeywordChange={handleKeywordChange}
            onRoleChange={handleRoleChange}
            onProviderChange={handleProviderChange}
            onBaptizedChange={handleBaptizedChange}
          />
        </div>

        <div className="flex flex-col flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-gray-200 min-h-[61px]">
            <p className="flex items-center gap-2 text-[15px] font-semibold text-gray-900">
              유저 목록
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {total}건
              </span>
            </p>
          </div>

          {isError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <p className="text-sm text-error-60">
                유저 목록을 불러오는 중 오류가 발생했습니다
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <UserTable
              users={users}
              isLoading={isLoading}
              selectedUserId={selectedUserId}
              onRowClick={handleRowClick}
            />
          )}

          <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              {total > 0
                ? `${(currentPage - 1) * PAGE_SIZE + 1} - ${Math.min(currentPage * PAGE_SIZE, total)} / ${total}건`
                : '0건'}
            </p>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>

      {mountedUserId && (
        <UserEditPanel
          key={mountedUserId}
          userId={mountedUserId}
          users={users}
          initialData={users.find((u) => u.id === mountedUserId)}
          isOpen={!!selectedUserId}
          onClose={handlePanelClose}
          onExited={handlePanelExited}
        />
      )}
    </div>
  );
}
