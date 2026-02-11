'use client';

import { Button, DatePicker, InputField } from '@samilhero/design-system';
import { Controller, type UseFormReturn } from 'react-hook-form';

import { type MissionFormData } from '../_schemas/missionSchema';

interface MissionFormProps {
  form: UseFormReturn<MissionFormData>;
  isPending: boolean;
}

export function MissionForm({ form, isPending }: MissionFormProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="차수"
          type="number"
          placeholder="차수"
          {...form.register('order', { valueAsNumber: true })}
          error={form.formState.errors.order?.message}
          disabled={isPending}
        />
      </div>

      <InputField
        label="선교 이름"
        placeholder="선교 이름을 입력하세요"
        {...form.register('name')}
        error={form.formState.errors.name?.message}
        disabled={isPending}
      />

      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="startDate"
          control={form.control}
          render={({ field }) => (
            <DatePicker
              {...field}
              label="선교 시작일"
              placeholder="YYYY-MM-DD"
              error={form.formState.errors.startDate?.message}
              disabled={isPending}
            />
          )}
        />
        <Controller
          name="endDate"
          control={form.control}
          render={({ field }) => (
            <DatePicker
              {...field}
              label="선교 종료일"
              placeholder="YYYY-MM-DD"
              error={form.formState.errors.endDate?.message}
              disabled={isPending}
              minDate={form.watch('startDate') || undefined}
            />
          )}
        />
      </div>

      <InputField
        label="담당 교역자"
        placeholder="담당 교역자 이름을 입력하세요"
        {...form.register('pastorName')}
        error={form.formState.errors.pastorName?.message}
        disabled={isPending}
      />
    </div>
  );
}
