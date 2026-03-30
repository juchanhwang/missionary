'use client';

import { InputField, Select } from '@samilhero/design-system';
import { ROLE_LABELS } from 'lib/constants/role';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { maskIdentityNumber } from '../../_utils/maskIdentityNumber';

import type { UserUpdateFormValues } from '../../_schemas/userSchema';
import type { User } from 'apis/user';

interface UserAuthInfoSectionProps {
  user: User;
  isAdmin: boolean;
}

export function UserAuthInfoSection({
  user,
  isAdmin,
}: UserAuthInfoSectionProps) {
  const form = useFormContext<UserUpdateFormValues>();
  const [showIdentity, setShowIdentity] = useState(false);

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="text-sm font-semibold text-gray-800 mb-2">
        인증 정보
      </legend>

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="role"
          control={form.control}
          render={({ field }) => (
            <Select value={field.value} onChange={field.onChange} label="역할">
              <Select.Trigger disabled={!isAdmin}>
                {field.value ? ROLE_LABELS[field.value] : '역할을 선택하세요'}
              </Select.Trigger>
              <Select.Options>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <Select.Option key={value} item={value}>
                    {label}
                  </Select.Option>
                ))}
              </Select.Options>
            </Select>
          )}
        />
        <InputField label="인증방식" value={user.provider ?? '-'} disabled />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField label="로그인 ID" value={user.loginId ?? '-'} disabled />
        <div>
          <p className="mb-1 text-xs font-normal leading-[1.833] text-gray-700">
            주민등록번호
          </p>
          <div className="flex items-center gap-2">
            <InputField
              hideLabel
              label="주민등록번호"
              value={
                showIdentity
                  ? (user.identityNumber ?? '-')
                  : maskIdentityNumber(user.identityNumber)
              }
              disabled
              className="flex-1 [&_input]:font-mono"
            />
            {isAdmin && user.identityNumber && (
              <button
                type="button"
                onClick={() => setShowIdentity((prev) => !prev)}
                className="flex h-9 shrink-0 items-center gap-1 rounded-lg border border-gray-200 px-3 text-xs font-medium text-primary-50 transition-colors hover:bg-primary-10"
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
        </div>
      </div>
    </fieldset>
  );
}
