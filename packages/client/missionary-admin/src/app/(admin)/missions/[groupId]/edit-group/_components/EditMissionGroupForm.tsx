'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@samilhero/design-system';
import { LoadingSpinner } from 'components/loading/LoadingSpinner';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { MissionGroupForm } from '../../../_components/MissionGroupForm';
import {
  missionGroupSchema,
  type MissionGroupSchemaType,
} from '../../../_schemas/missionGroupSchema';
import { useGetMissionGroup } from '../../_hooks/useGetMissionGroup';
import { useUpdateMissionGroupAction } from '../_hooks/useUpdateMissionGroupAction';

export function EditMissionGroupForm() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;

  const { data: group, isLoading } = useGetMissionGroup(groupId);
  const { mutate: updateMissionGroup, isPending } =
    useUpdateMissionGroupAction(groupId);

  const form = useForm<MissionGroupSchemaType>({
    resolver: zodResolver(missionGroupSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      description: '',
      category: undefined,
    },
  });

  useEffect(() => {
    if (group) {
      form.reset({
        name: group.name,
        description: group.description || '',
        category: group.category,
      });
    }
  }, [group, form]);

  const onSubmit = (data: MissionGroupSchemaType) => {
    updateMissionGroup(data, {
      onSuccess: () => {
        router.push(`/missions/${groupId}`);
      },
      onError: (error) => {
        console.error('Failed to update mission group:', error);
      },
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-sm text-gray-50">그룹을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col flex-1 p-8 gap-5 overflow-y-auto"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-semibold text-gray-90">선교 그룹 수정</h2>
          <p className="text-sm text-gray-50">{group.name}</p>
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
          onClick={() => router.push(`/missions/${groupId}`)}
        >
          취소
        </Button>
        <Button
          type="submit"
          disabled={!form.formState.isDirty || isPending}
          size="md"
        >
          {isPending ? '수정 중...' : '수정하기'}
        </Button>
      </div>
    </form>
  );
}
