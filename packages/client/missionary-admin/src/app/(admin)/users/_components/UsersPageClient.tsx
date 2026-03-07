'use client';

import { Pagination } from '@samilhero/design-system';
import {
  type AuthProvider,
  type GetUsersParams,
  type PaginatedUsersResponse,
  type UserRole,
} from 'apis/user';
import { useState } from 'react';

import { UserSearchFilter } from './UserSearchFilter';
import { UserTable } from './UserTable';
import { useGetUsers } from '../_hooks/useGetUsers';

const PAGE_SIZE = 20;

interface UsersPageClientProps {
  initialData: PaginatedUsersResponse;
}

export function UsersPageClient({ initialData }: UsersPageClientProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<GetUsersParams>({
    page: 1,
    pageSize: PAGE_SIZE,
    search: '',
    role: '',
    provider: '',
    isBaptized: '',
  });

  const { data, isLoading } = useGetUsers({
    params: searchParams,
    initialData,
  });

  const users = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? searchParams.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleSearchChange = (search: string) => {
    setSearchParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleRoleChange = (role: UserRole | '') => {
    setSearchParams((prev) => ({ ...prev, role, page: 1 }));
  };

  const handleProviderChange = (provider: AuthProvider | '') => {
    setSearchParams((prev) => ({ ...prev, provider, page: 1 }));
  };

  const handleBaptizedChange = (isBaptized: string) => {
    setSearchParams((prev) => ({ ...prev, isBaptized, page: 1 }));
  };

  const handleSelectUser = (id: string) => {
    setSelectedUserId((prev) => (prev === id ? null : id));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  return (
    <div className="flex flex-col flex-1 min-w-0">
      <div className="flex-1 p-8 overflow-y-auto">
        <UserSearchFilter
          search={searchParams.search ?? ''}
          role={searchParams.role ?? ''}
          provider={searchParams.provider ?? ''}
          isBaptized={searchParams.isBaptized ?? ''}
          onSearchChange={handleSearchChange}
          onRoleChange={handleRoleChange}
          onProviderChange={handleProviderChange}
          onBaptizedChange={handleBaptizedChange}
        />

        <div className="bg-white rounded-xl border border-gray-30 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-30">
            <p className="text-sm font-semibold text-gray-90">
              유저 목록
              <span className="ml-1.5 text-xs font-normal text-gray-50">
                {total}건
              </span>
            </p>
          </div>

          <UserTable
            users={users}
            isLoading={isLoading}
            selectedUserId={selectedUserId}
            onSelectUser={handleSelectUser}
          />

          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-30">
            <p className="text-xs text-gray-50">
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

      {selectedUserId && (
        <div className="absolute top-0 right-0 h-full w-[560px] bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.08),-1px_0_4px_rgba(0,0,0,0.04)] z-30 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-30">
            <h3 className="text-base font-bold text-gray-90">유저 상세</h3>
            <button
              type="button"
              onClick={() => setSelectedUserId(null)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-40 hover:text-gray-80 hover:bg-gray-10 transition-colors"
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center text-sm text-gray-50">
            유저 상세 패널 (Task 11에서 구현)
          </div>
        </div>
      )}
    </div>
  );
}
