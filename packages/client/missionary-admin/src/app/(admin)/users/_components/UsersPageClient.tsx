'use client';

import { overlay, Pagination } from '@samilhero/design-system';
import { PANEL_TRANSITION_MS } from 'components/ui/SidePanel';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useGetUsers } from '../_hooks/useGetUsers';
import { PAGE_SIZE, useUserFilterParams } from '../_hooks/useUserFilterParams';
import { UserEditPanel } from './panel/UserEditPanel';
import { UserSearchFilter } from './UserSearchFilter';
import { UserTable } from './UserTable';

export function UsersPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get('userId');

  const filter = useUserFilterParams();

  const { data, isLoading, isError, refetch } = useGetUsers({
    params: filter.queryParams,
  });

  const users = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? filter.params.page;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // overlay 생명주기 관리
  const panelRef = useRef<{ close: () => void; unmount: () => void } | null>(
    null,
  );
  const currentPanelUserIdRef = useRef<string | null>(null);

  const openPanel = (userId: string) => {
    if (currentPanelUserIdRef.current === userId) return;

    // 기존 패널 즉시 닫기 (애니메이션 없이)
    if (panelRef.current) {
      panelRef.current.close();
      panelRef.current.unmount();
      panelRef.current = null;
    }
    currentPanelUserIdRef.current = userId;

    overlay.open(({ isOpen, close, unmount }) => {
      panelRef.current = { close, unmount };

      return (
        <UserEditPanel
          userId={userId}
          users={users}
          initialData={users.find((u) => u.id === userId)}
          isOpen={isOpen}
          onClose={() => {
            close();
            setTimeout(unmount, PANEL_TRANSITION_MS);
            panelRef.current = null;
            currentPanelUserIdRef.current = null;
            const params = new URLSearchParams(window.location.search);
            params.delete('userId');
            const qs = params.toString();
            router.push(qs ? `/users?${qs}` : '/users');
          }}
          onExited={() => {}}
          onNavigateToUser={(id) => {
            close();
            unmount();
            panelRef.current = null;
            currentPanelUserIdRef.current = null;
            const params = new URLSearchParams(window.location.search);
            params.set('userId', id);
            router.push(`/users?${params.toString()}`);
          }}
        />
      );
    });
  };

  const selectUser = (id: string) => {
    openPanel(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set('userId', id);
    router.push(`/users?${params.toString()}`);
  };

  // URL 변경 감지: 초기 로드, 뒤로가기/앞으로가기, 패널 내 유저 전환
  useEffect(() => {
    if (selectedUserId) {
      openPanel(selectedUserId);
    } else if (currentPanelUserIdRef.current) {
      if (panelRef.current) {
        panelRef.current.close();
        setTimeout(() => {
          panelRef.current?.unmount();
          panelRef.current = null;
        }, PANEL_TRANSITION_MS);
      }
      currentPanelUserIdRef.current = null;
    }
  }, [selectedUserId]);

  // 컴포넌트 언마운트 시 overlay 정리
  useEffect(() => {
    return () => {
      if (panelRef.current) {
        panelRef.current.close();
        panelRef.current.unmount();
        panelRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0">
      <div className="flex flex-col flex-1 p-8 min-h-0">
        <div className="shrink-0">
          <UserSearchFilter
            searchType={filter.params.searchType}
            keyword={filter.params.keyword}
            role={filter.params.role}
            provider={filter.params.provider}
            isBaptized={filter.params.isBaptized}
            onSearchTypeChange={filter.setSearchType}
            onKeywordChange={filter.setKeyword}
            onClearKeyword={filter.clearKeyword}
            onRoleChange={filter.setRole}
            onProviderChange={filter.setProvider}
            onBaptizedChange={filter.setIsBaptized}
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
              onRowClick={selectUser}
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
                onPageChange={filter.setPage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
