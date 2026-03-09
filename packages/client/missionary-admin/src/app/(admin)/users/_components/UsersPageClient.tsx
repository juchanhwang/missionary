'use client';

import { Pagination } from '@samilhero/design-system';
import {
  type AuthProvider,
  type GetUsersParams,
  type PaginatedUsersResponse,
  type UserRole,
} from 'apis/user';
import { useAuth } from 'lib/auth/AuthContext';
import { useState } from 'react';

import { DeleteUserModal } from './DeleteUserModal';
import { UserDetailPanel } from './UserDetailPanel';
import { UserSearchFilter } from './UserSearchFilter';
import { UserTable } from './UserTable';
import { useGetUsers } from '../_hooks/useGetUsers';

const PAGE_SIZE = 20;

interface UsersPageClientProps {
  initialData: PaginatedUsersResponse;
}

export function UsersPageClient({ initialData }: UsersPageClientProps) {
  const { user: currentUser } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    userId: string;
    userName: string;
  } | null>(null);
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
      <div className="flex flex-col flex-1 p-8 min-h-0">
        <div className="shrink-0">
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
        </div>

        <div className="flex flex-col flex-1 min-h-0 bg-white rounded-xl border border-gray-30 shadow-sm overflow-hidden">
          <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-gray-30">
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

          <div className="shrink-0 flex items-center justify-between px-5 py-3.5 border-t border-gray-30">
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

      <UserDetailPanel
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        currentUserRole={currentUser.role as 'ADMIN' | 'STAFF'}
        onDeleteRequest={(userId, userName) =>
          setDeleteTarget({ userId, userName })
        }
      />

      {deleteTarget && (
        <DeleteUserModal
          isOpen={!!deleteTarget}
          userId={deleteTarget.userId}
          userName={deleteTarget.userName}
          onClose={() => setDeleteTarget(null)}
          onSuccess={() => {
            setDeleteTarget(null);
            setSelectedUserId(null);
          }}
        />
      )}
    </div>
  );
}
