'use client';

import {
  DatePicker,
  InputField,
  Radio,
  RadioGroup,
  Select,
  Switch,
} from '@samilhero/design-system';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';

import type { UserUpdateFormValues } from '../_schemas/userSchema';
import { formatDate } from '../_utils/formatDate';
import { maskIdentityNumber } from '../_utils/maskIdentityNumber';

import type { User } from 'apis/user';

const ROLE_LABELS: Record<string, string> = {
  USER: 'USER',
  STAFF: 'STAFF',
  ADMIN: 'ADMIN',
};

interface UserFormProps {
  form: UseFormReturn<UserUpdateFormValues>;
  user: User;
  isEditable: boolean;
  isAdmin: boolean;
}

export function UserForm({ form, user, isEditable, isAdmin }: UserFormProps) {
  const [showIdentity, setShowIdentity] = useState(false);

  return (
    <div className="flex flex-col gap-8">
      {/* 기본 정보 */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold text-gray-80 mb-2">
          기본 정보
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="이름"
            disabled={!isEditable}
            {...form.register('name')}
            error={form.formState.errors.name?.message}
          />
          <InputField
            label="이메일"
            type="email"
            value={user.email ?? ''}
            disabled
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="전화번호"
            type="tel"
            disabled={!isEditable}
            {...form.register('phoneNumber')}
          />
          <Controller
            name="birthDate"
            control={form.control}
            render={({ field }) => (
              <DatePicker
                label="생년월일"
                placeholder="YYYY-MM-DD"
                value={field.value ? new Date(field.value) : null}
                onChange={(date) =>
                  field.onChange(
                    date ? date.toISOString().slice(0, 10) : '',
                  )
                }
                disabled={!isEditable}
              />
            )}
          />
        </div>

        <div>
          <p className="mb-1 text-xs font-normal leading-[1.833] text-gray-70">
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

      {/* 인증 정보 */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold text-gray-80 mb-2">
          인증 정보
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="role"
            control={form.control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                label="역할"
              >
                <Select.Trigger disabled={!isAdmin}>
                  {field.value
                    ? ROLE_LABELS[field.value]
                    : '역할을 선택하세요'}
                </Select.Trigger>
                <Select.Options>
                  <Select.Option item="USER">USER</Select.Option>
                  <Select.Option item="STAFF">STAFF</Select.Option>
                  <Select.Option item="ADMIN">ADMIN</Select.Option>
                </Select.Options>
              </Select>
            )}
          />
          <InputField
            label="인증방식"
            value={user.provider ?? '-'}
            disabled
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="로그인 ID"
            value={user.loginId ?? '-'}
            disabled
          />
          <div>
            <p className="mb-1 text-xs font-normal leading-[1.833] text-gray-70">
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
          </div>
        </div>
      </fieldset>

      {/* 교회 정보 */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold text-gray-80 mb-2">
          교회 정보
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1 text-xs font-normal leading-[1.833] text-gray-70">
              세례 여부
            </p>
            <Controller
              name="isBaptized"
              control={form.control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={!isEditable}
                  label={field.value ? '받음' : '안 받음'}
                />
              )}
            />
          </div>
          <Controller
            name="baptizedAt"
            control={form.control}
            render={({ field }) => (
              <DatePicker
                label="세례일"
                placeholder="YYYY-MM-DD"
                value={field.value ? new Date(field.value) : null}
                onChange={(date) =>
                  field.onChange(
                    date ? date.toISOString().slice(0, 10) : '',
                  )
                }
                disabled={!isEditable}
              />
            )}
          />
        </div>
      </fieldset>

      {/* 시스템 정보 */}
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-semibold text-gray-80 mb-2">
          시스템 정보
        </legend>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="가입일"
            value={formatDate(user.createdAt)}
            disabled
          />
          <InputField
            label="수정일"
            value={formatDate(user.updatedAt)}
            disabled
          />
        </div>
      </fieldset>
    </div>
  );
}
