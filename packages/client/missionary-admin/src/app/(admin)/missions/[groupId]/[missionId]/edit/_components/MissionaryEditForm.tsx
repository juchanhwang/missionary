'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type Missionary } from 'apis/missionary';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { DeleteMissionSection } from './DeleteMissionSection';
import { FormPageLayout } from '../../../../_components/FormPageLayout';
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
      pastorPhone: missionary.pastorPhone || '',
      participationStartDate: missionary.participationStartDate
        ? new Date(missionary.participationStartDate)
        : undefined,
      participationEndDate: missionary.participationEndDate
        ? new Date(missionary.participationEndDate)
        : undefined,
      price: missionary.price,
      description: missionary.description || '',
      maximumParticipantCount: missionary.maximumParticipantCount,
      bankName: missionary.bankName || '',
      bankAccountHolder: missionary.bankAccountHolder || '',
      bankAccountNumber: missionary.bankAccountNumber || '',
      order: missionary.order,
      status: missionary.status,
    },
  });

  const onSubmit = (data: MissionFormData) => {
    const payload = {
      ...toMissionPayload(data),
      missionGroupId: missionary.missionGroupId,
    };

    startTransition(async () => {
      try {
        await updateMissionaryAction(
          missionary.id,
          missionary.missionGroupId!,
          payload,
        );
      } catch (e) {
        if (isRedirectError(e)) throw e;
        toast.error('선교 수정에 실패했습니다');
      }
    });
  };

  return (
    <FormPageLayout
      onSubmit={form.handleSubmit(onSubmit)}
      title="선교 수정"
      description={missionary.name}
      headerAction={
        <DeleteMissionSection
          missionaryId={missionary.id}
          missionaryName={missionary.name}
          missionGroupId={missionary.missionGroupId!}
        />
      }
      onCancel={() => router.push(`/missions/${missionary.missionGroupId}`)}
      submitLabel="수정하기"
      pendingLabel="수정 중..."
      isPending={isPending}
      submitDisabled={!form.formState.isDirty || isPending}
    >
      <MissionForm
        form={form}
        isPending={isPending}
        groupName={missionary.missionGroup?.name ?? ''}
      />
    </FormPageLayout>
  );
}
