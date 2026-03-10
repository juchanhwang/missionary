'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@samilhero/design-system';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from 'lib/auth/AuthContext';
import { queryKeys } from 'lib/queryKeys';
import {
  ArrowRightFromLine,
  ChevronDown,
  ChevronUp,
  Ellipsis,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from 'react-modal';

import { DeleteUserModal } from '../../../../_components/DeleteUserModal';
import { UserForm } from '../../../../_components/UserForm';
import { useUpdateUserAction } from '../../../../_hooks/useUpdateUserAction';
import {
  userUpdateSchema,
  type UserUpdateFormValues,
} from '../../../../_schemas/userSchema';

import type { PaginatedUsersResponse } from 'apis/user';
import type { User } from 'apis/user';

interface UserEditPanelProps {
  user: User;
}

function toFormValues(user: User): UserUpdateFormValues {
  return {
    name: user.name ?? '',
    phoneNumber: user.phoneNumber ?? '',
    birthDate: user.birthDate ? user.birthDate.slice(0, 10) : '',
    gender:
      user.gender === 'MALE' || user.gender === 'FEMALE'
        ? user.gender
        : undefined,
    isBaptized: user.isBaptized,
    baptizedAt: user.baptizedAt ? user.baptizedAt.slice(0, 10) : '',
    role: user.role,
  };
}

function useCachedUserList() {
  const queryClient = useQueryClient();

  return useMemo(() => {
    const queries = queryClient.getQueriesData<PaginatedUsersResponse>({
      queryKey: queryKeys.users.all,
    });

    for (const [, data] of queries) {
      if (data?.data && data.data.length > 0) {
        return data.data;
      }
    }

    return [];
  }, [queryClient]);
}

export function UserEditPanel({ user }: UserEditPanelProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser.role === 'ADMIN';
  const isEditable = isAdmin;

  const updateUser = useUpdateUserAction(user.id);
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const cachedUsers = useCachedUserList();

  const currentIndex = cachedUsers.findIndex((u) => u.id === user.id);

  const prevUser = currentIndex > 0 ? cachedUsers[currentIndex - 1] : null;
  const nextUser =
    currentIndex >= 0 && currentIndex < cachedUsers.length - 1
      ? cachedUsers[currentIndex + 1]
      : null;

  const navigateToUser = useCallback(
    (targetUser: User) => {
      router.push(`/users/${targetUser.id}/edit`);
    },
    [router],
  );

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
    setTimeout(() => router.push('/users'), 300);
  };

  const requestClose = () => {
    if (form.formState.isDirty) {
      setIsConfirmOpen(true);
    } else {
      handleClose();
    }
  };

  const confirmClose = () => {
    setIsConfirmOpen(false);
    handleClose();
  };

  const form = useForm<UserUpdateFormValues>({
    resolver: zodResolver(userUpdateSchema),
    mode: 'onSubmit',
    defaultValues: toFormValues(user),
  });

  const { isDirty } = form.formState;

  const onSubmit = (data: UserUpdateFormValues) => {
    updateUser.mutate(
      {
        name: data.name,
        phoneNumber: data.phoneNumber || undefined,
        birthDate: data.birthDate || undefined,
        gender: data.gender || undefined,
        isBaptized: data.isBaptized,
        baptizedAt: data.baptizedAt || undefined,
        ...(isAdmin && data.role ? { role: data.role } : {}),
      },
      {
        onSuccess: () => {
          form.reset(data);
        },
      },
    );
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
                onClick={() => prevUser && navigateToUser(prevUser)}
                disabled={!prevUser}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-60 transition-colors hover:bg-gray-10 hover:text-gray-70 disabled:opacity-30 disabled:pointer-events-none"
                title="이전 유저"
              >
                <ChevronUp size={18} />
              </button>
              <button
                type="button"
                onClick={() => nextUser && navigateToUser(nextUser)}
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
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-60 transition-colors hover:bg-gray-10 hover:text-gray-80"
                >
                  <Ellipsis size={18} />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-gray-30 bg-white py-1 shadow-lg">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsModalOpen(true);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error-60 transition-colors hover:bg-error-10"
                      >
                        유저 삭제
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel Body */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
              <UserForm
                form={form}
                user={user}
                isEditable={isEditable}
                isAdmin={isAdmin}
              />
            </div>

            {/* Bottom Actions */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-gray-30 bg-white px-6 py-4">
              <div>
                {isDirty && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-40">
                    <span className="h-1.5 w-1.5 rounded-full bg-warning-50" />
                    변경사항이 있습니다
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  size="md"
                  disabled={!isDirty || updateUser.isPending}
                >
                  {updateUser.isPending ? '저장 중...' : '저장'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {isModalOpen && (
        <DeleteUserModal
          isOpen={isModalOpen}
          userId={user.id}
          userName={user.name ?? '-'}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            setIsVisible(false);
            setTimeout(() => router.push('/users'), 300);
          }}
        />
      )}

      <Modal
        isOpen={isConfirmOpen}
        onRequestClose={() => setIsConfirmOpen(false)}
        contentLabel="변경사항 확인"
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
        appElement={
          typeof window !== 'undefined'
            ? document.body
            : undefined
        }
      >
        <div className="bg-white rounded-xl border border-gray-10 p-6 max-w-sm w-full">
          <h2 className="text-lg font-bold text-gray-90 mb-3">
            변경사항이 있습니다
          </h2>
          <p className="text-sm text-gray-50 mb-6">
            저장하지 않은 변경사항이 있습니다. 그래도 닫으시겠습니까?
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              color="neutral"
              size="md"
              onClick={() => setIsConfirmOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="filled"
              color="primary"
              size="md"
              onClick={confirmClose}
            >
              닫기
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
