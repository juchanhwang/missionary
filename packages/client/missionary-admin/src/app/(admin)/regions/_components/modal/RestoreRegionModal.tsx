'use client';

import { Button } from '@samilhero/design-system';
import { RotateCcw, X } from 'lucide-react';
import { useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'sonner';

import { useRestoreRegion } from '../../_hooks/useRestoreRegion';

import type { DeletedRegionListItem } from 'apis/missionaryRegion';

interface RestoreRegionModalProps {
  isOpen: boolean;
  close: (result: boolean) => void;
  region: DeletedRegionListItem;
}

export function RestoreRegionModal({
  isOpen,
  close,
  region,
}: RestoreRegionModalProps) {
  const { mutate, isPending } = useRestoreRegion();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('body');
    }
  }, []);

  const handleConfirm = () => {
    mutate(
      { missionGroupId: region.missionGroupId, regionId: region.id },
      {
        onSuccess: () => {
          toast.success('연계지가 복구되었습니다');
          close(true);
        },
        onError: () => {
          toast.error('연계지 복구에 실패했습니다');
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => close(false)}
      contentLabel="연계지 복구 확인"
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 z-50 bg-black/30 flex items-center justify-center"
      shouldCloseOnEsc={!isPending}
      shouldCloseOnOverlayClick={!isPending}
    >
      <div
        className="bg-white rounded-xl border border-gray-50 max-w-sm w-full"
        role="dialog"
        aria-modal="true"
        aria-labelledby="restore-region-modal-title"
      >
        <div className="flex items-start gap-3.5 px-6 py-5 border-b border-gray-200">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-green-100 text-green-600">
            <RotateCcw size={20} />
          </div>
          <div>
            <h2
              id="restore-region-modal-title"
              className="text-[17px] font-bold text-gray-900 mb-1"
            >
              연계지 복구
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              &apos;{region.name}&apos;을(를) 활성 연계지로 복구하시겠습니까?
            </p>
          </div>
          <button
            type="button"
            onClick={() => close(false)}
            disabled={isPending}
            className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2.5 justify-end px-6 py-4">
          <Button
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() => close(false)}
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            variant="filled"
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={handleConfirm}
            disabled={isPending}
          >
            <RotateCcw size={13} />
            {isPending ? '복구 중...' : '복구'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
