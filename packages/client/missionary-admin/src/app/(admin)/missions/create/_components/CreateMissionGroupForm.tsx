'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { FormPageLayout } from '../../_components/FormPageLayout';
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
      onError: () => toast.error('선교 그룹 생성에 실패했습니다'),
    });
  };

  return (
    <FormPageLayout
      onSubmit={form.handleSubmit(onSubmit)}
      title="선교 그룹 생성"
      description="새로운 선교 그룹을 생성합니다"
      onCancel={() => router.push('/missions')}
      submitLabel="생성하기"
      pendingLabel="생성 중..."
      isPending={isPending}
    >
      <MissionGroupForm form={form} isPending={isPending} />
    </FormPageLayout>
  );
}
