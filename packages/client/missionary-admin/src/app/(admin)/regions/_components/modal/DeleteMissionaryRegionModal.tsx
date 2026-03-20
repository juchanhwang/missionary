'use client';

import { Button } from '@samilhero/design-system';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'sonner';

import { useDeleteMissionaryRegion } from '../../_hooks/useDeleteMissionaryRegion';

import type { RegionListItem } from 'apis/missionaryRegion';

interface DeleteMissionaryRegionModalProps {
  isOpen: boolean;
  close: (result: boolean) => void;
  region: RegionListItem;
}

export function DeleteMissionaryRegionModal({
  isOpen,
  close,
  region,
}: DeleteMissionaryRegionModalProps) {
  const { mutate, isPending } = useDeleteMissionaryRegion();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('body');
    }
  }, []);

  const handleConfirm = () => {
    mutate(
      { missionaryId: region.missionaryId, regionId: region.id },
      {
        onSuccess: () => {
          toast.success('연계지가 삭제되었습니다');
          close(true);
        },
        onError: () => {
          toast.error('연계지 삭제에 실패했습니다');
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => close(false)}
      contentLabel="연계지 삭제 확인"
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 bg-black/30 flex items-center justify-center"
      shouldCloseOnEsc={!isPending}
      shouldCloseOnOverlayClick={!isPending}
    >
      <div
        className="bg-white rounded-xl border border-gray-50 p-6 max-w-sm w-full"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-region-modal-title"
      >
        <div className="flex items-center justify-between mb-3">
          <h2
            id="delete-region-modal-title"
            className="text-lg font-bold text-gray-900"
          >
            연계지 삭제
          </h2>
          <button
            type="button"
            onClick={() => close(false)}
            disabled={isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-2">
          &apos;{region.name}&apos;을(를) 삭제하시겠습니까?
        </p>
        <p className="text-xs text-gray-300 mb-6">
          삭제한 데이터는 복구할 수 없습니다.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            color="neutral"
            size="md"
            onClick={() => close(false)}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            variant="filled"
            color="primary"
            size="md"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? '삭제 중...' : '삭제'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
