'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useCreateMissionary } from './_hooks/useCreateMissionary';
import { MissionForm } from '../../../_components/MissionForm';
import {
  missionSchema,
  type MissionFormData,
} from '../../../_schemas/missionSchema';
import { toMissionPayload } from '../../../_utils/toMissionPayload';
import { useMissionGroup } from '../../_hooks/useMissionGroup';

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
      <div className="flex justify-center items-center h-full">로딩 중...</div>
    );
  }

  if (!group) {
    return (
      <div className="flex justify-center items-center h-full">
        그룹을 찾을 수 없습니다
      </div>
    );
  }

  return (
    <div className="max-w-2xl flex flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-90 mb-2">
        {group.name} - N차 선교 생성
      </h1>
      <MissionForm
        form={form}
        onSubmit={onSubmit}
        isPending={createMutation.isPending}
        submitLabel="생성하기"
        pendingLabel="생성 중..."
        groupId={groupId}
        groupName={group.name}
      />
    </div>
  );
}
