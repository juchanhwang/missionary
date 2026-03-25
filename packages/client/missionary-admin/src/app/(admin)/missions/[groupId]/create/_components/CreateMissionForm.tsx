'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingSpinner } from 'components/loading';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { FormPageLayout } from '../../../_components/FormPageLayout';
import { MissionForm } from '../../../_components/MissionForm';
import {
  missionSchema,
  type MissionFormData,
} from '../../../_schemas/missionSchema';
import { toMissionPayload } from '../../../_utils/toMissionPayload';
import { useGetMissionGroup } from '../../_hooks/useGetMissionGroup';
import { useMissionGroupId } from '../../_hooks/useMissionGroupId';
import { useCreateMissionaryAction } from '../_hooks/useCreateMissionaryAction';

export function CreateMissionForm() {
  const router = useRouter();
  const groupId = useMissionGroupId();

  const { data: group, isLoading: isGroupLoading } =
    useGetMissionGroup(groupId);
  const createMutation = useCreateMissionaryAction();

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
      onError: () => {
        toast.error('선교 생성에 실패했습니다');
      },
    });
  };

  if (isGroupLoading) {
    return <LoadingSpinner />;
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p className="text-sm text-gray-400">그룹을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <FormPageLayout
      onSubmit={form.handleSubmit(onSubmit)}
      title="선교 생성"
      description={`${group.name} 그룹에 새로운 선교를 추가합니다`}
      onCancel={() => router.push(`/missions/${groupId}`)}
      submitLabel="생성하기"
      pendingLabel="생성 중..."
      isPending={createMutation.isPending}
    >
      <MissionForm
        form={form}
        isPending={createMutation.isPending}
        groupName={group.name}
      />
    </FormPageLayout>
  );
}
