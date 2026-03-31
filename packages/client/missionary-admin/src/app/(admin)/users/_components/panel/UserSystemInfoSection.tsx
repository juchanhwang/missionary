'use client';

import { InputField } from '@samilhero/design-system';
import { formatDate } from 'lib/utils/formatDate';

import type { User } from 'apis/user';

interface UserSystemInfoSectionProps {
  user: User;
}

export function UserSystemInfoSection({ user }: UserSystemInfoSectionProps) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="text-sm font-semibold text-gray-800 mb-2">
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
  );
}
