'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@samilhero/design-system';
import { useAuth } from 'lib/auth/AuthContext';
import { Trash2, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { DeleteUserModal } from '../../../../_components/DeleteUserModal';
import { UserForm } from '../../../../_components/UserForm';
import { useUpdateUserAction } from '../../../../_hooks/useUpdateUserAction';
import {
  userUpdateSchema,
  type UserUpdateFormValues,
} from '../../../../_schemas/userSchema';

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

export function UserEditPanel({ user }: UserEditPanelProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser.role === 'ADMIN';
  const isEditable = isAdmin;

  const updateUser = useUpdateUserAction(user.id);
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const isEditPath = /^\/users\/[^/]+\/edit$/.test(pathname);

    if (isEditPath) {
      requestAnimationFrame(() => setIsVisible(true));
    }
  }, [pathname]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => router.push('/users'), 300);
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

  const handleReset = () => {
    form.reset(toFormValues(user));
  };

  return (
    <>
      <div
        className={`fixed right-0 top-0 h-full w-[560px] z-30 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.08),-1px_0_4px_rgba(0,0,0,0.04)]">
          {/* Panel Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-30 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-base font-bold text-white">
                {(user.name ?? '?').charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-90">
                    {user.name ?? '-'}
                  </h3>
                  <RoleBadge role={user.role} />
                </div>
                <p className="mt-0.5 text-xs text-gray-50">
                  {user.email ?? '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-40 transition-colors hover:bg-error-10 hover:text-error-60"
                  title="유저 삭제"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-40 transition-colors hover:bg-gray-10 hover:text-gray-80"
              >
                <X size={18} />
              </button>
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
                {isDirty && (
                  <Button
                    type="button"
                    variant="outline"
                    color="neutral"
                    size="md"
                    onClick={handleReset}
                  >
                    되돌리기
                  </Button>
                )}
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
    </>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colorClass =
    role === 'ADMIN'
      ? 'bg-primary-10 text-primary-50'
      : role === 'STAFF'
        ? 'bg-green-10 text-green-60'
        : 'bg-gray-20 text-gray-60';

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${colorClass}`}
    >
      {role}
    </span>
  );
}
