'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@samilhero/design-system';
import { Eye, EyeOff, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useGetUser } from '../_hooks/useGetUser';
import { useUpdateUser } from '../_hooks/useUpdateUser';
import {
  userUpdateSchema,
  type UserUpdateFormValues,
} from '../_schemas/userSchema';

interface UserDetailPanelProps {
  userId: string | null;
  onClose: () => void;
  currentUserRole: 'ADMIN' | 'STAFF';
  onDeleteRequest?: (userId: string, userName: string) => void;
}

function maskIdentityNumber(identityNumber: string | null): string {
  if (!identityNumber) return '-';
  if (identityNumber.length >= 7) {
    return `${identityNumber.slice(0, 6)}-${identityNumber.charAt(6)}${'*'.repeat(6)}`;
  }
  return identityNumber;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return dateString.slice(0, 10);
}

function getProviderLabel(provider: string | null): string {
  return provider ?? '-';
}

export function UserDetailPanel({
  userId,
  onClose,
  currentUserRole,
  onDeleteRequest,
}: UserDetailPanelProps) {
  const isOpen = userId !== null;
  const { data: user, isLoading } = useGetUser(userId ?? '');
  const updateUser = useUpdateUser(userId ?? '');
  const [showIdentity, setShowIdentity] = useState(false);

  const isAdmin = currentUserRole === 'ADMIN';
  const isEditable = isAdmin;

  const form = useForm<UserUpdateFormValues>({
    resolver: zodResolver(userUpdateSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      phoneNumber: '',
      birthDate: '',
      gender: undefined,
      isBaptized: false,
      baptizedAt: '',
      role: 'USER',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
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
      });
      setShowIdentity(false);
    }
  }, [user, form]);

  const { isDirty } = form.formState;

  const onSubmit = (data: UserUpdateFormValues) => {
    if (!userId) return;
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
    if (user) {
      form.reset({
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
      });
    }
  };

  const handleDelete = () => {
    if (userId && user?.name && onDeleteRequest) {
      onDeleteRequest(userId, user.name);
    }
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full w-[560px] z-30 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex h-full flex-col bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.08),-1px_0_4px_rgba(0,0,0,0.04)]">
        {/* Panel Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-30 px-6 py-4">
          <div className="flex items-center gap-3">
            {user && (
              <>
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
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {isAdmin && onDeleteRequest && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-40 transition-colors hover:bg-red-10 hover:text-red-50"
                title="유저 삭제"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-40 transition-colors hover:bg-gray-10 hover:text-gray-80"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Panel Body */}
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-50">
            불러오는 중...
          </div>
        ) : !user ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-50">
            유저 정보를 찾을 수 없습니다
          </div>
        ) : (
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 overflow-y-auto pb-20">
              {/* Section: Basic Info */}
              <SectionHeader title="기본 정보" />
              <div className="flex flex-col gap-4 border-b border-gray-30 px-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="이름">
                    <input
                      type="text"
                      disabled={!isEditable}
                      {...form.register('name')}
                      className={fieldInputClass(isEditable)}
                    />
                    {form.formState.errors.name && (
                      <p className="mt-0.5 text-[11px] text-red-50">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </FieldGroup>
                  <FieldGroup label="이메일" readOnly>
                    <input
                      type="email"
                      value={user.email ?? ''}
                      readOnly
                      className="h-9 cursor-not-allowed rounded-lg border border-gray-30 bg-gray-10 px-3 text-sm text-gray-40 outline-none"
                    />
                  </FieldGroup>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="전화번호">
                    <input
                      type="tel"
                      disabled={!isEditable}
                      {...form.register('phoneNumber')}
                      className={fieldInputClass(isEditable)}
                    />
                  </FieldGroup>
                  <FieldGroup label="생년월일">
                    <input
                      type="date"
                      disabled={!isEditable}
                      {...form.register('birthDate')}
                      className={fieldInputClass(isEditable)}
                    />
                  </FieldGroup>
                </div>
                <FieldGroup label="성별">
                  <div className="flex items-center gap-4">
                    <label
                      className={`flex items-center gap-1.5 ${isEditable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    >
                      <input
                        type="radio"
                        value="MALE"
                        disabled={!isEditable}
                        {...form.register('gender')}
                        className="h-3.5 w-3.5 accent-primary-50"
                      />
                      <span className="text-sm text-gray-80">남</span>
                    </label>
                    <label
                      className={`flex items-center gap-1.5 ${isEditable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    >
                      <input
                        type="radio"
                        value="FEMALE"
                        disabled={!isEditable}
                        {...form.register('gender')}
                        className="h-3.5 w-3.5 accent-primary-50"
                      />
                      <span className="text-sm text-gray-80">여</span>
                    </label>
                  </div>
                </FieldGroup>
              </div>

              {/* Section: Auth Info */}
              <SectionHeader title="인증 정보" />
              <div className="flex flex-col gap-4 border-b border-gray-30 px-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="역할">
                    <select
                      disabled={!isAdmin}
                      {...form.register('role')}
                      className={`${fieldInputClass(isAdmin)} bg-white`}
                    >
                      <option value="USER">USER</option>
                      <option value="STAFF">STAFF</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </FieldGroup>
                  <FieldGroup label="인증방식" readOnly>
                    <input
                      type="text"
                      value={getProviderLabel(user.provider)}
                      readOnly
                      className="h-9 cursor-not-allowed rounded-lg border border-gray-30 bg-gray-10 px-3 text-sm text-gray-40 outline-none"
                    />
                  </FieldGroup>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="로그인 ID" readOnly>
                    <input
                      type="text"
                      value={user.loginId ?? '-'}
                      readOnly
                      className="h-9 cursor-not-allowed rounded-lg border border-gray-30 bg-gray-10 px-3 text-sm text-gray-40 outline-none"
                    />
                  </FieldGroup>
                  <FieldGroup label="주민등록번호">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={
                          showIdentity
                            ? (user.identityNumber ?? '-')
                            : maskIdentityNumber(user.identityNumber)
                        }
                        readOnly
                        className="h-9 flex-1 cursor-not-allowed rounded-lg border border-gray-30 bg-gray-10 px-3 font-mono text-sm text-gray-90 outline-none"
                      />
                      {isAdmin && user.identityNumber && (
                        <button
                          type="button"
                          onClick={() => setShowIdentity((prev) => !prev)}
                          className="flex h-9 shrink-0 items-center gap-1 rounded-lg border border-gray-30 px-3 text-xs font-medium text-primary-50 transition-colors hover:bg-primary-10"
                        >
                          {showIdentity ? (
                            <>
                              <EyeOff size={14} />
                              숨기기
                            </>
                          ) : (
                            <>
                              <Eye size={14} />
                              보기
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </FieldGroup>
                </div>
              </div>

              {/* Section: Church Info */}
              <SectionHeader title="교회 정보" />
              <div className="flex flex-col gap-4 border-b border-gray-30 px-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="세례 여부">
                    <div className="flex h-9 items-center gap-2">
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          disabled={!isEditable}
                          checked={form.watch('isBaptized')}
                          onChange={(e) =>
                            form.setValue('isBaptized', e.target.checked, {
                              shouldDirty: true,
                            })
                          }
                          className="peer sr-only"
                        />
                        <div className="h-5 w-9 rounded-full bg-gray-30 transition-colors peer-checked:bg-primary-50" />
                        <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
                      </label>
                      <span className="text-sm text-gray-80">
                        {form.watch('isBaptized') ? '받음' : '안 받음'}
                      </span>
                    </div>
                  </FieldGroup>
                  <FieldGroup label="세례일">
                    <input
                      type="date"
                      disabled={!isEditable}
                      {...form.register('baptizedAt')}
                      className={fieldInputClass(isEditable)}
                    />
                  </FieldGroup>
                </div>
              </div>

              {/* Section: System Info */}
              <SectionHeader title="시스템 정보" />
              <div className="px-6 py-4">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <dt className="mb-0.5 text-[10px] text-gray-40">가입일</dt>
                    <dd className="text-xs text-gray-60">
                      {formatDate(user.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="mb-0.5 text-[10px] text-gray-40">수정일</dt>
                    <dd className="text-xs text-gray-60">
                      {formatDate(user.updatedAt)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-gray-30 bg-white px-6 py-4">
              <div>
                {isDirty && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-40">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-50" />
                    변경사항이 있습니다
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isDirty && (
                  <Button
                    type="button"
                    variant="outline"
                    color="neutral"
                    size="sm"
                    onClick={handleReset}
                  >
                    되돌리기
                  </Button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  disabled={!isDirty || updateUser.isPending}
                >
                  {updateUser.isPending ? '저장 중...' : '저장'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-gray-30 bg-gray-5 px-6 py-3">
      <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-40">
        {title}
      </h4>
    </div>
  );
}

function FieldGroup({
  label,
  readOnly,
  children,
}: {
  label: string;
  readOnly?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-gray-50">
        {label}
        {readOnly && (
          <span className="ml-0.5 rounded bg-gray-15 px-1 py-px text-[10px] font-normal text-gray-40">
            읽기 전용
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const colorClass =
    role === 'ADMIN'
      ? 'bg-primary-10 text-primary-50'
      : role === 'STAFF'
        ? 'bg-green-10 text-green-60'
        : 'bg-gray-15 text-gray-60';

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${colorClass}`}
    >
      {role}
    </span>
  );
}

function fieldInputClass(editable: boolean): string {
  if (editable) {
    return 'h-9 rounded-lg border border-gray-30 px-3 text-sm text-gray-90 outline-none transition-[border-color,box-shadow] focus:border-primary-50 focus:shadow-[0_0_0_3px_rgba(91,108,240,0.1)]';
  }
  return 'h-9 cursor-not-allowed rounded-lg border border-gray-30 bg-gray-10 px-3 text-sm text-gray-40 outline-none';
}
