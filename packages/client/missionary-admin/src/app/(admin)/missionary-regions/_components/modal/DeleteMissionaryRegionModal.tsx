'use client';

import { useEffect } from 'react';
import Modal from 'react-modal';

interface DeleteMissionaryRegionModalProps {
  isOpen: boolean;
  close: (confirmed: boolean) => void;
  regionName: string;
  isPending: boolean;
}

export function DeleteMissionaryRegionModal({
  isOpen,
  close,
  regionName,
  isPending,
}: DeleteMissionaryRegionModalProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('body');
    }
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => close(false)}
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 bg-black/30 flex items-center justify-center"
    >
      <div className="w-full max-w-[400px] rounded-xl border border-gray-50 bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">연계지 삭제</h2>
          <button
            type="button"
            onClick={() => close(false)}
            className="rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <p className="mb-2 text-sm text-gray-700">
          &apos;{regionName}&apos;을(를) 삭제하시겠습니까?
        </p>
        <p className="mb-6 text-sm text-gray-400">
          삭제한 데이터는 복구할 수 없습니다.
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => close(false)}
            disabled={isPending}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => close(true)}
            disabled={isPending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
