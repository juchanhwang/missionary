'use client';

import { InputField, Select } from '@samilhero/design-system';
import { Controller, type UseFormReturn } from 'react-hook-form';

import { type MissionGroupSchemaType } from '../_schemas/missionGroupSchema';

const TYPE_LABELS: Record<string, string> = {
  DOMESTIC: '국내',
  ABROAD: '해외',
};

interface MissionGroupFormProps {
  form: UseFormReturn<MissionGroupSchemaType>;
  isPending: boolean;
}

export function MissionGroupForm({ form, isPending }: MissionGroupFormProps) {
  return (
    <div className="flex flex-col gap-5">
      <InputField
        label="선교 그룹명"
        placeholder="선교 그룹명을 입력하세요"
        {...form.register('name')}
        error={form.formState.errors.name?.message}
        disabled={isPending}
      />

      <Controller
        name="type"
        control={form.control}
        render={({ field }) => (
          <Select
            value={field.value}
            onChange={field.onChange}
            label="선교 유형"
            error={form.formState.errors.type?.message}
          >
            <Select.Trigger disabled={isPending}>
              {field.value ? TYPE_LABELS[field.value] : '선교 유형 선택'}
            </Select.Trigger>
            <Select.Options>
              <Select.Option item="DOMESTIC">국내</Select.Option>
              <Select.Option item="ABROAD">해외</Select.Option>
            </Select.Options>
          </Select>
        )}
      />

      <InputField
        label="설명"
        placeholder="설명을 입력하세요 (선택)"
        {...form.register('description')}
        error={form.formState.errors.description?.message}
        disabled={isPending}
      />
    </div>
  );
}
