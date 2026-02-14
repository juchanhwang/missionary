'use client';

import { Button, openOverlayAsync } from '@samilhero/design-system';
import { useTransition } from 'react';

import { DeleteConfirmModal } from './DeleteConfirmModal';
import { deleteMissionaryAction } from '../_actions/missionaryActions';

interface DeleteMissionSectionProps {
  missionaryId: string;
  missionaryName: string;
  missionGroupId: string;
}

export function DeleteMissionSection({
  missionaryId,
  missionaryName,
  missionGroupId,
}: DeleteMissionSectionProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    const confirmed = await openOverlayAsync<boolean>(({ isOpen, close }) => (
      <DeleteConfirmModal
        isOpen={isOpen}
        close={close}
        missionaryName={missionaryName}
        isPending={isPending}
      />
    ));

    if (confirmed) {
      startTransition(async () => {
        await deleteMissionaryAction(missionaryId, missionGroupId);
      });
    }
  };

  return (
    <Button
      type="button"
      onClick={handleDelete}
      color="neutral"
      className="flex-1 bg-error-60 hover:bg-error-70 text-white"
      size="lg"
    >
      삭제하기
    </Button>
  );
}
