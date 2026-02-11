'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@samilhero/design-system';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useCreateMissionary } from './_hooks/useCreateMissionary';
import { MissionForm } from '../../_components/MissionForm';
import {
  missionSchema,
  type MissionFormData,
} from '../../_schemas/missionSchema';
import { toMissionPayload } from '../../_utils/toMissionPayload';
import { useMissionGroup } from '../_hooks/useMissionGroup';

export default function CreateMissionPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;

  const { data: group, isLoading: isGroupLoading } = useMissionGroup(groupId);
  const createMutation = useCreateMissionary();

  const form = useForm<MissionFormData>({
    resolver: zodResolver(missionSchema),
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (group) {
      const groupMissionaries = group.missionaries || [];
      const maxOrder = Math.max(
        0,
        ...groupMissionaries.map((m) => m.order || 0),
      );
      const nextOrder = maxOrder + 1;

      form.reset({
        order: nextOrder,
        name: `${nextOrder}차 ${group.name}`,
      });
    }
  }, [group, form]);

  const onSubmit = (data: MissionFormData) => {
    const payload = {
      ...toMissionPayload(data),
      missionGroupId: groupId,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        router.push(`/missions/${groupId}`);
      },
      onError: (error) => {
        console.error(error);
      },
    });
  };

  if (isGroupLoading) {
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
          <h2 className="text-lg font-semibold text-gray-90">선교 생성</h2>
          <p className="text-sm text-gray-50">
            {group.name} 그룹에 새로운 선교를 추가합니다
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-30 shadow-sm p-6">
        <MissionForm form={form} isPending={createMutation.isPending} />
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
        <Button type="submit" disabled={createMutation.isPending} size="md">
          {createMutation.isPending ? '생성 중...' : '생성하기'}
        </Button>
      </div>
    </form>
  );
}
