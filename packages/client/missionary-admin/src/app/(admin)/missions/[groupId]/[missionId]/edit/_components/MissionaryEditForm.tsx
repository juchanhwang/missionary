'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@samilhero/design-system';
import { type Missionary } from 'apis/missionary';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { DeleteMissionSection } from './DeleteMissionSection';
import { MissionForm } from '../../../../_components/MissionForm';
import {
  missionSchema,
  type MissionFormData,
} from '../../../../_schemas/missionSchema';
import { toMissionPayload } from '../../../../_utils/toMissionPayload';
import { updateMissionaryAction } from '../_actions/missionaryActions';

interface MissionaryEditFormProps {
  missionary: Missionary;
}

export function MissionaryEditForm({ missionary }: MissionaryEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<MissionFormData>({
    resolver: zodResolver(missionSchema),
    mode: 'onSubmit',
    defaultValues: {
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
    },
  });

  const onSubmit = (data: MissionFormData) => {
    const payload = {
      ...toMissionPayload(data),
      missionGroupId: missionary.missionGroupId,
    };

    startTransition(async () => {
      await updateMissionaryAction(
        missionary.id,
        missionary.missionGroupId!,
        payload,
      );
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col flex-1 p-8 gap-5 overflow-y-auto"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-semibold text-gray-90">선교 수정</h2>
          <p className="text-sm text-gray-50">{missionary.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-30 shadow-sm p-6">
        <MissionForm form={form} isPending={isPending} />
      </div>

      <div className="flex items-center justify-between">
        <DeleteMissionSection
          missionaryId={missionary.id}
          missionaryName={missionary.name}
          missionGroupId={missionary.missionGroupId!}
        />
        <div className="flex items-center gap-3">
          <Button
            type="button"
            color="neutral"
            variant="outline"
            size="md"
            onClick={() =>
              router.push(`/missions/${missionary.missionGroupId}`)
            }
          >
            취소
          </Button>
          <Button type="submit" disabled={isPending} size="md">
            {isPending ? '수정 중...' : '수정하기'}
          </Button>
        </div>
      </div>
    </form>
  );
}
