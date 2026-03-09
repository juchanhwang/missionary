'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@samilhero/design-system';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { DeleteUserSection } from './DeleteUserSection';
import { UserForm } from '../../../_components/UserForm';
import { useUpdateUserAction } from '../../../_hooks/useUpdateUserAction';
import {
  userUpdateSchema,
  type UserUpdateFormValues,
} from '../../../_schemas/userSchema';

import { useAuth } from 'lib/auth/AuthContext';

import type { User } from 'apis/user';

interface UserEditFormProps {
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

export function UserEditForm({ user }: UserEditFormProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser.role === 'ADMIN';
  const isEditable = isAdmin;

  const updateUser = useUpdateUserAction(user.id);

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
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col flex-1 p-8 gap-5 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-semibold text-gray-90">유저 수정</h2>
          <p className="text-sm text-gray-50">{user.name ?? '-'}</p>
        </div>
        {isAdmin && (
          <DeleteUserSection userId={user.id} userName={user.name ?? '-'} />
        )}
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-gray-30 shadow-sm p-6">
        <UserForm
          form={form}
          user={user}
          isEditable={isEditable}
          isAdmin={isAdmin}
        />
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            color="neutral"
            size="md"
            onClick={() => router.push('/users')}
          >
            취소
          </Button>
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
  );
}
