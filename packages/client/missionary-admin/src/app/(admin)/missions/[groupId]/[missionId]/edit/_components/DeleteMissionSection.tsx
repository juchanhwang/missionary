'use client';

import { Button, openOverlayAsync } from '@samilhero/design-system';

import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useDeleteMissionaryAction } from '../_hooks/useDeleteMissionaryAction';

interface DeleteMissionSectionProps {
  missionaryId: string;
  missionaryName: string;
  onDeleteSuccess: () => void;
}

export function DeleteMissionSection({
  missionaryId,
  missionaryName,
  onDeleteSuccess,
}: DeleteMissionSectionProps) {
  const deleteMutation = useDeleteMissionaryAction(missionaryId);

  const handleDelete = async () => {
    const confirmed = await openOverlayAsync<boolean>(({ isOpen, close }) => (
      <DeleteConfirmModal
        isOpen={isOpen}
        close={close}
        missionaryName={missionaryName}
        isPending={deleteMutation.isPending}
      />
    ));

    if (confirmed) {
      deleteMutation.mutate(undefined, {
        onSuccess: onDeleteSuccess,
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
