'use client';

import {
  Button,
  DatePicker,
  InputField,
  Select,
} from '@samilhero/design-system';
import { useMissionaries } from 'hooks/missionary/useMissionaries';
import { Controller, type UseFormReturn } from 'react-hook-form';

import { useMissionGroups } from '../hooks/useMissionGroups';
import { type MissionFormData } from '../schemas/missionSchema';

interface MissionFormProps {
  form: UseFormReturn<MissionFormData>;
  onSubmit: (data: MissionFormData) => void;
  isPending: boolean;
  submitLabel: string;
  pendingLabel: string;
}

export function MissionForm({
  form,
  onSubmit,
  isPending,
  submitLabel,
  pendingLabel,
}: MissionFormProps) {
  const { data: missionGroups } = useMissionGroups();
  const { data: missionaries } = useMissionaries();

  const handleMissionGroupChange = (value?: string | string[] | null) => {
    if (typeof value !== 'string') return;
    form.setValue('missionGroupId', value);

    const selectedGroup = missionGroups?.find((group) => group.id === value);
    if (!selectedGroup) return;

    const groupMissionaries =
      missionaries?.filter((m) => m.missionGroupId === value) || [];
    const maxOrder = Math.max(0, ...groupMissionaries.map((m) => m.order || 0));
    const nextOrder = maxOrder + 1;

    form.setValue('order', nextOrder);
    form.setValue('name', `${nextOrder}차 ${selectedGroup.name}`);
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="missionGroupId"
          control={form.control}
          render={({ field }) => (
            <Select value={field.value} onChange={handleMissionGroupChange}>
              <Select.Trigger disabled={isPending}>
                {missionGroups?.find((g) => g.id === field.value)?.name ||
                  '선교 그룹 선택 (선택 시 자동완성)'}
              </Select.Trigger>
              <Select.Options>
                {missionGroups?.map((group) => (
                  <Select.Option key={group.id} item={group.id}>
                    {group.name}
                  </Select.Option>
                ))}
              </Select.Options>
            </Select>
          )}
        />
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

      <div className="mt-4">
        <Button
          type="submit"
          disabled={isPending}
          size="lg"
          className="w-full"
          color="primary"
        >
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
