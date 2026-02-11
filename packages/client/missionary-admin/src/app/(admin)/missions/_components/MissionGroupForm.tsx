'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, InputField, Select } from '@samilhero/design-system';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';

import { useCreateMissionGroup } from '../_hooks/useCreateMissionGroup';
import {
  missionGroupSchema,
  type MissionGroupSchemaType,
} from '../_schemas/missionGroupSchema';

const TYPE_LABELS: Record<string, string> = {
  DOMESTIC: '국내',
  ABROAD: '해외',
};

interface MissionGroupFormProps {
  submitLabel: string;
  pendingLabel: string;
}

export function MissionGroupForm({
  submitLabel,
  pendingLabel,
}: MissionGroupFormProps) {
  const router = useRouter();
  const form = useForm<MissionGroupSchemaType>({
    resolver: zodResolver(missionGroupSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      description: '',
      type: undefined,
    },
  });

  const { mutate, isPending } = useCreateMissionGroup();

  const onSubmit = (data: MissionGroupSchemaType) => {
    mutate(data, {
      onSuccess: () => {
        router.push('/missions');
      },
      onError: (error) => {
        console.error('Failed to create mission group:', error);
      },
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-5 rounded-xl bg-white border border-gray-10 p-6"
    >
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
          <Select value={field.value} onChange={field.onChange}>
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
      {form.formState.errors.type?.message && (
        <span className="text-sm text-error-50">
          {form.formState.errors.type.message}
        </span>
      )}

      <InputField
        label="설명"
        placeholder="설명을 입력하세요 (선택)"
        {...form.register('description')}
        error={form.formState.errors.description?.message}
        disabled={isPending}
      />

      <div className="mt-2">
        <Button
          type="submit"
          disabled={isPending}
          size="lg"
          className="w-full"
          color="neutral"
        >
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
