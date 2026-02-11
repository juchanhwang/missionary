'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { MissionGroupForm } from '../components/MissionGroupForm';
import { useCreateMissionGroup } from '../hooks/useCreateMissionGroup';
import {
  missionGroupSchema,
  type MissionGroupSchemaType,
} from '../schemas/missionGroupSchema';

export default function CreateMissionGroupPage() {
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

  const createMutation = useCreateMissionGroup();

  const onSubmit = (data: MissionGroupSchemaType) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        router.push('/missions');
      },
      onError: (error) => {
        console.error('Failed to create mission group:', error);
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4 py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">신규 선교 그룹 생성</h1>
      <MissionGroupForm
        form={form}
        onSubmit={onSubmit}
        isPending={createMutation.isPending}
        submitLabel="생성하기"
        pendingLabel="생성 중..."
      />
    </div>
  );
}
