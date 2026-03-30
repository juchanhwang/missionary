'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@samilhero/design-system';
import { useAuth } from 'lib/auth/AuthContext';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { UserAuthInfoSection } from './UserAuthInfoSection';
import { UserBasicInfoSection } from './UserBasicInfoSection';
import { UserChurchInfoSection } from './UserChurchInfoSection';
import { UserSystemInfoSection } from './UserSystemInfoSection';
import { useUpdateUserAction } from '../../_hooks/useUpdateUserAction';
import {
  userUpdateSchema,
  type UserUpdateFormValues,
} from '../../_schemas/userSchema';

import type { User } from 'apis/user';

interface UserFormProps {
  user: User;
  onDirtyChange: (isDirty: boolean) => void;
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

export function UserForm({ user, onDirtyChange }: UserFormProps) {
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

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

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
          toast.success('유저 정보가 저장되었습니다');
        },
      },
    );
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-24">
          <div className="flex flex-col gap-8">
            <UserBasicInfoSection user={user} isEditable={isEditable} />
            <UserAuthInfoSection user={user} isAdmin={isAdmin} />
            <UserChurchInfoSection isEditable={isEditable} />
            <UserSystemInfoSection user={user} />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4">
          <div>
            {isDirty && (
              <div className="flex items-center gap-1.5 text-xs text-gray-300">
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
    </FormProvider>
  );
}
