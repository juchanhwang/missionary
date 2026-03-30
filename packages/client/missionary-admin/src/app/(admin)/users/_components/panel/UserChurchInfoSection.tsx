'use client';

import { DatePicker, Switch } from '@samilhero/design-system';
import { Controller, useFormContext } from 'react-hook-form';

import type { UserUpdateFormValues } from '../../_schemas/userSchema';

interface UserChurchInfoSectionProps {
  isEditable: boolean;
}

export function UserChurchInfoSection({
  isEditable,
}: UserChurchInfoSectionProps) {
  const form = useFormContext<UserUpdateFormValues>();

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="text-sm font-semibold text-gray-800 mb-2">
        교회 정보
      </legend>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1 text-xs font-normal leading-[1.833] text-gray-700">
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
                field.onChange(date ? date.toISOString().slice(0, 10) : '')
              }
              disabled={!isEditable}
            />
          )}
        />
      </div>
    </fieldset>
  );
}
