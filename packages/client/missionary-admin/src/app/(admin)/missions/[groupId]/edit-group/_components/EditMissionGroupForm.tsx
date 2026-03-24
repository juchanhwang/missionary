'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingSpinner } from 'components/loading';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { FormPageLayout } from '../../../_components/FormPageLayout';
import { MissionGroupForm } from '../../../_components/MissionGroupForm';
import {
  missionGroupSchema,
  type MissionGroupSchemaType,
} from '../../../_schemas/missionGroupSchema';
import { useGetMissionGroup } from '../../_hooks/useGetMissionGroup';
import { useMissionGroupId } from '../../_hooks/useMissionGroupId';
import { useUpdateMissionGroupAction } from '../_hooks/useUpdateMissionGroupAction';

export function EditMissionGroupForm() {
  const router = useRouter();
  const groupId = useMissionGroupId();

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
      onError: () => {
        toast.error('선교 그룹 수정에 실패했습니다');
      },
    });
  };

  if (isLoading) {
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
      title="선교 그룹 수정"
      description={group.name}
      onCancel={() => router.push(`/missions/${groupId}`)}
      submitLabel="수정하기"
      pendingLabel="수정 중..."
      isPending={isPending}
      submitDisabled={!form.formState.isDirty || isPending}
    >
      <MissionGroupForm form={form} isPending={isPending} />
    </FormPageLayout>
  );
}
