'use client';

import { Button } from '@samilhero/design-system';
import { useState } from 'react';

import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useDeleteMissionary } from '../hooks/useDeleteMissionary';

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteMutation = useDeleteMissionary(missionaryId);

  const handleConfirmDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: onDeleteSuccess,
    });
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsDeleteModalOpen(true)}
        color="secondary"
        className="flex-1 bg-error-60 hover:bg-error-70 text-white"
        size="lg"
      >
        삭제하기
      </Button>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        missionaryName={missionaryName}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
