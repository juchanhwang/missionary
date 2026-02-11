'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type Missionary } from 'apis/missionary';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { MissionForm } from '../../../../../components/MissionForm';
import {
  missionSchema,
  type MissionFormData,
} from '../../../../../schemas/missionSchema';
import { toMissionPayload } from '../../../../../utils/toMissionPayload';
import { useUpdateMissionary } from '../hooks/useUpdateMissionary';
import { DeleteMissionSection } from './DeleteMissionSection';

interface MissionaryEditFormProps {
  missionary: Missionary;
}

export function MissionaryEditForm({ missionary }: MissionaryEditFormProps) {
  const router = useRouter();
  const updateMutation = useUpdateMissionary(missionary.id);

  const form = useForm<MissionFormData>({
    resolver: zodResolver(missionSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      pastorName: '',
    },
  });

  useEffect(() => {
    form.reset({
      name: missionary.name,
      startDate: new Date(missionary.startDate),
      endDate: new Date(missionary.endDate),
      pastorName: missionary.pastorName || '',
      participationStartDate: missionary.participationStartDate
        ? new Date(missionary.participationStartDate)
        : undefined,
      participationEndDate: missionary.participationEndDate
        ? new Date(missionary.participationEndDate)
        : undefined,
      order: missionary.order,
    });
  }, [missionary, form]);

  const onSubmit = (data: MissionFormData) => {
    const payload = {
      ...toMissionPayload(data),
      missionGroupId: missionary.missionGroupId,
    };

    updateMutation.mutate(payload, {
      onSuccess: () => {
        router.push(`/missions/${missionary.missionGroupId}`);
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
        onSubmit={onSubmit}
        isPending={updateMutation.isPending}
        submitLabel="수정하기"
        pendingLabel="수정 중..."
        groupId={missionary.missionGroupId || ''}
        groupName=""
      />

      <DeleteMissionSection
        missionaryId={missionary.id}
        missionaryName={missionary.name}
        onDeleteSuccess={() =>
          router.push(`/missions/${missionary.missionGroupId}`)
        }
      />
    </div>
  );
}
