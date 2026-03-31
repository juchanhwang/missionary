'use client';

import {
  DatePicker,
  InputField,
  Radio,
  RadioGroup,
} from '@samilhero/design-system';
import { formatPhoneNumber } from 'lib/utils/formatPhoneNumber';
import { Controller, useFormContext } from 'react-hook-form';

import type { UserUpdateFormValues } from '../../_schemas/userSchema';
import type { User } from 'apis/user';

interface UserBasicInfoSectionProps {
  user: User;
  isEditable: boolean;
}

export function UserBasicInfoSection({
  user,
  isEditable,
}: UserBasicInfoSectionProps) {
  const form = useFormContext<UserUpdateFormValues>();

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="text-sm font-semibold text-gray-800 mb-2">
        기본 정보
      </legend>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="user-name"
            className="mb-1 text-xs font-normal leading-[1.833] text-gray-700"
          >
            이름 <span className="text-red-600">*</span>
          </label>
          <InputField
            id="user-name"
            disabled={!isEditable}
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />
        </div>
        <InputField
          label="이메일"
          type="email"
          value={user.email ?? ''}
          disabled
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="phoneNumber"
          control={form.control}
          render={({ field, fieldState }) => (
            <InputField
              label="전화번호"
              type="tel"
              disabled={!isEditable}
              value={field.value ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                field.onChange(formatPhoneNumber(e.target.value))
              }
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="birthDate"
          control={form.control}
          render={({ field, fieldState }) => (
            <DatePicker
              label="생년월일"
              placeholder="YYYY-MM-DD"
              value={field.value ? new Date(field.value) : null}
              onChange={(date) =>
                field.onChange(date ? date.toISOString().slice(0, 10) : '')
              }
              disabled={!isEditable}
              error={fieldState.error?.message}
            />
          )}
        />
      </div>

      <div>
        <p className="mb-1 text-xs font-normal leading-[1.833] text-gray-700">
          성별
        </p>
        <Controller
          name="gender"
          control={form.control}
          render={({ field }) => (
            <RadioGroup
              value={field.value ?? ''}
              onChange={field.onChange}
              disabled={!isEditable}
              className="flex items-center gap-4"
            >
              <Radio value="MALE" label="남" />
              <Radio value="FEMALE" label="여" />
            </RadioGroup>
          )}
        />
      </div>
    </fieldset>
  );
}
