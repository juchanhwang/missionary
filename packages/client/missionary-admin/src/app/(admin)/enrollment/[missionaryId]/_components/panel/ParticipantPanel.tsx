'use client';

import { Badge, overlay } from '@samilhero/design-system';
import { PANEL_TRANSITION_MS, SidePanel } from 'components/ui/SidePanel';
import { useEffect, useRef } from 'react';

import { ParticipantForm } from './ParticipantForm';
import { useGetParticipation } from '../../_hooks/useGetParticipation';
import { useUpdateParticipation } from '../../_hooks/useUpdateParticipation';
import { formatDate } from '../../_utils/formatParticipant';

import type { ParticipantFormValues } from '../../_schemas/participantSchema';
import type {
  AttendanceOption,
  FormFieldDefinition,
  Participation,
} from 'apis/participation';

interface ParticipantPanelProps {
  participantId: string;
  participants: Participation[];
  attendanceOptions: AttendanceOption[];
  formFields: FormFieldDefinition[];
  missionName: string;
  isOpen: boolean;
  onClose: () => void;
  onExited: () => void;
  onNavigate: (id: string) => void;
}

export function ParticipantPanel({
  participantId,
  participants,
  attendanceOptions,
  formFields,
  missionName,
  isOpen,
  onClose,
  onExited,
  onNavigate,
}: ParticipantPanelProps) {
  const isDirtyRef = useRef(false);

  const {
    data: participant,
    isLoading,
    isError,
  } = useGetParticipation({
    id: participantId,
    initialData: participants.find((p) => p.id === participantId),
  });

  const updateMutation = useUpdateParticipation();

  const currentIndex = participants.findIndex((p) => p.id === participantId);
  const prevParticipant =
    currentIndex > 0 ? participants[currentIndex - 1] : null;
  const nextParticipant =
    currentIndex >= 0 && currentIndex < participants.length - 1
      ? participants[currentIndex + 1]
      : null;

  const confirmIfDirty = async (): Promise<boolean> => {
    if (!isDirtyRef.current) return true;

    const { UnsavedChangesModal } =
      await import('app/(admin)/users/_components/panel/UnsavedChangesModal');

    const confirmed = await overlay.openAsync<boolean>(
      ({ isOpen: isModalOpen, close, unmount }) => (
        <UnsavedChangesModal
          isOpen={isModalOpen}
          close={(result) => {
            close(result);
            setTimeout(unmount, PANEL_TRANSITION_MS);
          }}
        />
      ),
    );
    return !!confirmed;
  };

  const requestClose = async () => {
    if (await confirmIfDirty()) {
      onClose();
    }
  };

  // Escape 키 → dirty guard 경유하여 닫기
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        requestClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = async (id: string) => {
    if (!(await confirmIfDirty())) return;
    onNavigate(id);
  };

  const handleSubmit = (data: ParticipantFormValues) => {
    updateMutation.mutate(
      { id: participantId, data },
      {
        onSuccess: () => {
          isDirtyRef.current = false;
        },
      },
    );
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={requestClose}
      onExited={onExited}
      title={participant?.name ?? '-'}
      subtitle={
        participant
          ? `${formatDate(participant.createdAt)} · ${missionName}`
          : undefined
      }
      badge={
        participant ? (
          <Badge variant={participant.isPaid ? 'success' : 'warning'}>
            {participant.isPaid ? '납부완료' : '미납'}
          </Badge>
        ) : undefined
      }
      onPrev={prevParticipant ? () => navigateTo(prevParticipant.id) : null}
      onNext={nextParticipant ? () => navigateTo(nextParticipant.id) : null}
      isLoading={isLoading}
      isError={isError || !participant}
      errorMessage="등록자 정보를 불러오는 중 오류가 발생했습니다"
    >
      {participant && (
        <ParticipantForm
          participant={participant}
          attendanceOptions={attendanceOptions}
          formFields={formFields}
          onSubmit={handleSubmit}
          onDirtyChange={(dirty) => {
            isDirtyRef.current = dirty;
          }}
          isPending={updateMutation.isPending}
        />
      )}
    </SidePanel>
  );
}
