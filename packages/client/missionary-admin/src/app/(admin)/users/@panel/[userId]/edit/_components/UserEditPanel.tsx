'use client';

import { overlay } from '@samilhero/design-system';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'lib/queryKeys';
import {
  ArrowRightFromLine,
  ChevronDown,
  ChevronUp,
  Ellipsis,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { UserForm } from './UserForm';
import { DeleteUserModal } from 'app/(admin)/users/@panel/[userId]/edit/_components/DeleteUserModal';
import { UnsavedChangesModal } from 'app/(admin)/users/@panel/[userId]/edit/_components/UnsavedChangesModal';

import type { PaginatedUsersResponse, User } from 'apis/user';

const PANEL_TRANSITION_MS = 300;

interface UserEditPanelProps {
  user: User;
}

function useCachedUserList() {
  const queryClient = useQueryClient();
  const queries = queryClient.getQueriesData<PaginatedUsersResponse>({
    queryKey: queryKeys.users.all,
  });

  for (const [, data] of queries) {
    if (data?.data && data.data.length > 0) {
      return data.data;
    }
  }

  return [];
}

export function UserEditPanel({ user }: UserEditPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isDirtyRef = useRef(false);

  const cachedUsers = useCachedUserList();

  const currentIndex = cachedUsers.findIndex((u) => u.id === user.id);

  const prevUser = currentIndex > 0 ? cachedUsers[currentIndex - 1] : null;
  const nextUser =
    currentIndex >= 0 && currentIndex < cachedUsers.length - 1
      ? cachedUsers[currentIndex + 1]
      : null;

  useEffect(() => {
    const isEditPath = /^\/users\/[^/]+\/edit$/.test(pathname);

    if (isEditPath) {
      requestAnimationFrame(() => setIsVisible(true));
    }
  }, [pathname]);

  // 메뉴 외부 클릭 감지
  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => router.push('/users'), PANEL_TRANSITION_MS);
  };

  const requestClose = async () => {
    if (isDirtyRef.current) {
      const confirmed = await overlay.openAsync<boolean>(
        ({ isOpen, close, unmount }) => (
          <UnsavedChangesModal
            isOpen={isOpen}
            close={(result) => {
              close(result);
              setTimeout(unmount, PANEL_TRANSITION_MS);
            }}
          />
        ),
      );
      if (confirmed) {
        handleClose();
      }
    } else {
      handleClose();
    }
  };

  const handleDirtyChange = (dirty: boolean) => {
    isDirtyRef.current = dirty;
  };

  return (
    <>
      {/* Backdrop */}
      {isVisible && (
        <div
          className="fixed inset-0 z-20"
          onClick={requestClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed right-0 top-0 h-full w-[560px] z-30 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.08),-1px_0_4px_rgba(0,0,0,0.04)]">
          {/* Panel Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-30 px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={requestClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-60 transition-colors hover:bg-gray-10 hover:text-gray-80"
                title="패널 닫기"
              >
                <ArrowRightFromLine size={18} />
              </button>
              <h3 className="text-sm font-semibold text-gray-90">
                {user.name ?? '-'}
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  prevUser && router.push(`/users/${prevUser.id}/edit`)
                }
                disabled={!prevUser}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-60 transition-colors hover:bg-gray-10 hover:text-gray-70 disabled:opacity-30 disabled:pointer-events-none"
                title="이전 유저"
              >
                <ChevronUp size={18} />
              </button>
              <button
                type="button"
                onClick={() =>
                  nextUser && router.push(`/users/${nextUser.id}/edit`)
                }
                disabled={!nextUser}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-60 transition-colors hover:bg-gray-10 hover:text-gray-70 disabled:opacity-30 disabled:pointer-events-none"
                title="다음 유저"
              >
                <ChevronDown size={18} />
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  aria-expanded={isMenuOpen}
                  aria-haspopup="menu"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-60 transition-colors hover:bg-gray-10 hover:text-gray-80"
                >
                  <Ellipsis size={18} />
                </button>
                {isMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-gray-30 bg-white py-1 shadow-lg"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={async () => {
                        setIsMenuOpen(false);
                        const deleted = await overlay.openAsync<boolean>(
                          ({ isOpen, close, unmount }) => (
                            <DeleteUserModal
                              isOpen={isOpen}
                              close={(result) => {
                                close(result);
                                setTimeout(unmount, PANEL_TRANSITION_MS);
                              }}
                              userId={user.id}
                              userName={user.name ?? '-'}
                            />
                          ),
                        );
                        if (deleted) {
                          setIsVisible(false);
                          setTimeout(
                            () => router.push('/users'),
                            PANEL_TRANSITION_MS,
                          );
                        }
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error-60 transition-colors hover:bg-error-10"
                    >
                      유저 삭제
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel Body */}
          <UserForm user={user} onDirtyChange={handleDirtyChange} />
        </div>
      </div>
    </>
  );
}
