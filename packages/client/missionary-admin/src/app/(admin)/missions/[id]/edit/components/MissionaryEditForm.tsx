'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type Missionary } from 'apis/missionary';
import { type Region } from 'apis/region';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { DeleteMissionSection } from './DeleteMissionSection';
import { MissionForm } from '../../../components/MissionForm';
import {
  missionSchema,
  type MissionFormData,
} from '../../../schemas/missionSchema';
import { toMissionPayload } from '../../../utils/toMissionPayload';
import { useUpdateMissionary } from '../hooks/useUpdateMissionary';

interface MissionaryEditFormProps {
  missionary: Missionary;
  regions: Region[] | undefined;
}

export function MissionaryEditForm({
  missionary,
  regions,
}: MissionaryEditFormProps) {
  const router = useRouter();
  const updateMutation = useUpdateMissionary(missionary.id);

  const form = useForm<MissionFormData>({
    resolver: zodResolver(missionSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      pastorName: '',
      regionId: '',
    },
  });

  useEffect(() => {
    form.reset({
      name: missionary.name,
      startDate: new Date(missionary.startDate),
      endDate: new Date(missionary.endDate),
      pastorName: missionary.pastorName || '',
      regionId: missionary.regionId || '',
      participationStartDate: new Date(missionary.participationStartDate),
      participationEndDate: new Date(missionary.participationEndDate),
    });
  }, [missionary, form]);

  const onSubmit = (data: MissionFormData) => {
    updateMutation.mutate(toMissionPayload(data), {
      onSuccess: () => {
        router.push('/missions');
      },
      onError: (error) => {
        console.error('Failed to update missionary:', error);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <MissionForm
        form={form}
        regions={regions}
        onSubmit={onSubmit}
        isPending={updateMutation.isPending}
        submitLabel="수정하기"
        pendingLabel="수정 중..."
      />

      <DeleteMissionSection
        missionaryId={missionary.id}
        missionaryName={missionary.name}
        onDeleteSuccess={() => router.push('/missions')}
      />
    </div>
  );
}
