'use client';

import { overlay } from '@samilhero/design-system';
import {
  ArrowRightFromLine,
  ChevronDown,
  ChevronUp,
  Ellipsis,
  Loader2,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { DeleteUserModal } from './DeleteUserModal';
import { UnsavedChangesModal } from './UnsavedChangesModal';
import { UserForm } from './UserForm';
import { useGetUser } from '../../_hooks/useGetUser';

import type { User } from 'apis/user';

const PANEL_TRANSITION_MS = 300;

interface UserEditPanelProps {
  userId: string;
  users: User[];
  initialData?: User;
  isOpen: boolean;
  onClose: () => void;
  onExited: () => void;
}

export function UserEditPanel({
  userId,
  users,
  initialData,
  isOpen,
  onClose,
  onExited,
}: UserEditPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isDirtyRef = useRef(false);

  const { data: user, isLoading, isError } = useGetUser(userId, initialData);

  const currentIndex = users.findIndex((u) => u.id === userId);

  const prevUser = currentIndex > 0 ? users[currentIndex - 1] : null;
  const nextUser =
    currentIndex >= 0 && currentIndex < users.length - 1
      ? users[currentIndex + 1]
      : null;

  // 마운트 시 slide-in
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  // isOpen이 false로 바뀌면 slide-out 트리거 (렌더 중 파생 상태)
  if (!isOpen && isVisible) {
    setIsVisible(false);
  }

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
    onClose(); // URL 즉시 변경 (query param 제거)
  };

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName === 'translate' && !isVisible) {
      onExited(); // 애니메이션 완료 후 언마운트
    }
  };

  const requestClose = async () => {
    if (isDirtyRef.current) {
      const confirmed = await overlay.openAsync<boolean>(
        ({ isOpen: isModalOpen, close, unmount }) => (
          <UnsavedChangesModal
            isOpen={isModalOpen}
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

  const navigateToUser = (targetUserId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('userId', targetUserId);
    router.push(`/users?${params.toString()}`);
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

      <aside
        className={`fixed right-0 top-0 h-full w-[560px] z-30 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="flex h-full flex-col bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.08),-1px_0_4px_rgba(0,0,0,0.04)]">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : isError || !user ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <p className="text-sm text-error-60">
                유저 정보를 불러오는 중 오류가 발생했습니다
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          ) : (
            <>
              {/* Panel Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={requestClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
                    title="패널 닫기"
                  >
                    <ArrowRightFromLine size={18} />
                  </button>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {user.name ?? '-'}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => prevUser && navigateToUser(prevUser.id)}
                    disabled={!prevUser}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:pointer-events-none"
                    title="이전 유저"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => nextUser && navigateToUser(nextUser.id)}
                    disabled={!nextUser}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:pointer-events-none"
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
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
                    >
                      <Ellipsis size={18} />
                    </button>
                    {isMenuOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={async () => {
                            setIsMenuOpen(false);
                            const deleted = await overlay.openAsync<boolean>(
                              ({ isOpen: isModalOpen, close, unmount }) => (
                                <DeleteUserModal
                                  isOpen={isModalOpen}
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
                              onClose();
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
            </>
          )}
        </div>
      </aside>
    </>
  );
}
