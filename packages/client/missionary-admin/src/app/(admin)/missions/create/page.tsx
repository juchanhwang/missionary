'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { MissionForm } from '../components/MissionForm';
import { useRegions } from '../hooks/useRegions';
import { missionSchema, type MissionFormData } from '../schemas/missionSchema';
import { toMissionPayload } from '../utils/toMissionPayload';
import { useCreateMissionary } from './hooks/useCreateMissionary';

export default function CreateMissionPage() {
  const router = useRouter();
  const form = useForm<MissionFormData>({
    resolver: zodResolver(missionSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      pastorName: '',
      regionId: '',
    },
  });

  const { data: regions } = useRegions();
  const createMutation = useCreateMissionary();

  const onSubmit = (data: MissionFormData) => {
    createMutation.mutate(toMissionPayload(data), {
      onSuccess: () => {
        router.push('/missions');
      },
      onError: (error) => {
        console.error('Failed to create missionary:', error);
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4 py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">신규 국내선교 생성</h1>
      <MissionForm
        form={form}
        regions={regions}
        onSubmit={onSubmit}
        isPending={createMutation.isPending}
        submitLabel="생성하기"
        pendingLabel="생성 중..."
      />
    </div>
  );
}
