'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@samilhero/design-system';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { MissionGroupForm } from '../../_components/MissionGroupForm';
import { useCreateMissionGroupAction } from '../../_hooks/useCreateMissionGroupAction';
import {
  missionGroupSchema,
  type MissionGroupSchemaType,
} from '../../_schemas/missionGroupSchema';

export function CreateMissionGroupForm() {
  const router = useRouter();
  const form = useForm<MissionGroupSchemaType>({
    resolver: zodResolver(missionGroupSchema),
    mode: 'onSubmit',
    defaultValues: { name: '', description: '', category: undefined },
  });
  const { mutate, isPending } = useCreateMissionGroupAction();

  const onSubmit = (data: MissionGroupSchemaType) => {
    mutate(data, {
      onSuccess: () => router.push('/missions'),
      onError: (error) =>
        console.error('Failed to create mission group:', error),
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col flex-1 p-8 gap-5 overflow-y-auto"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-semibold text-gray-90">선교 그룹 생성</h2>
          <p className="text-sm text-gray-50">새로운 선교 그룹을 생성합니다</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-30 shadow-sm p-6">
        <MissionGroupForm form={form} isPending={isPending} />
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          color="neutral"
          variant="outline"
          size="md"
          onClick={() => router.push('/missions')}
        >
          취소
        </Button>
        <Button type="submit" disabled={isPending} size="md">
          {isPending ? '생성 중...' : '생성하기'}
        </Button>
      </div>
    </form>
  );
}
