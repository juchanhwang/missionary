'use client';

import { InputField, Select } from '@samilhero/design-system';
import { ROLE_LABELS } from 'lib/constants/role';
import { Controller, useFormContext } from 'react-hook-form';

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

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="text-sm font-semibold text-gray-800 mb-2">
        인증 정보
      </legend>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-normal leading-[1.833] text-gray-700">
            역할 <span className="text-red-600">*</span>
          </label>
          <Controller
            name="role"
            control={form.control}
            render={({ field }) => (
              <Select value={field.value} onChange={field.onChange}>
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
        </div>
        <InputField label="인증방식" value={user.provider ?? '-'} disabled />
      </div>

      <InputField label="로그인 ID" value={user.loginId ?? '-'} disabled />
    </fieldset>
  );
}
