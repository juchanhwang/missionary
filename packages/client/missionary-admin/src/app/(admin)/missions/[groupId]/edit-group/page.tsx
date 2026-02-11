'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@samilhero/design-system';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useUpdateMissionGroup } from './_hooks/useUpdateMissionGroup';
import { MissionGroupForm } from '../../_components/MissionGroupForm';
import {
  missionGroupSchema,
  type MissionGroupSchemaType,
} from '../../_schemas/missionGroupSchema';
import { useMissionGroup } from '../_hooks/useMissionGroup';

export default function EditMissionGroupPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;

  const { data: group, isLoading } = useMissionGroup(groupId);
  const { mutate: updateMissionGroup, isPending } =
    useUpdateMissionGroup(groupId);

  const form = useForm<MissionGroupSchemaType>({
    resolver: zodResolver(missionGroupSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      description: '',
      type: undefined,
    },
  });

  useEffect(() => {
    if (group) {
      form.reset({
        name: group.name,
        description: group.description || '',
        type: group.type,
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
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-30 border-t-gray-60 rounded-full animate-spin" />
          <p className="text-sm text-gray-50">불러오는 중...</p>
        </div>
      </div>
    );
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
        <Button type="submit" disabled={isPending} size="md">
          {isPending ? '수정 중...' : '수정하기'}
        </Button>
      </div>
    </form>
  );
}
