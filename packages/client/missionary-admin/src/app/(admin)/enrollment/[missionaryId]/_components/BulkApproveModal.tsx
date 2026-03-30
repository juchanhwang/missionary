'use client';

import { Button } from '@samilhero/design-system';
import { useEffect } from 'react';
import Modal from 'react-modal';

interface BulkApproveModalProps {
  isOpen: boolean;
  close: (confirmed: boolean) => void;
  count: number;
}

export function BulkApproveModal({
  isOpen,
  close,
  count,
}: BulkApproveModalProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('body');
    }
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => close(false)}
      contentLabel="납부 일괄 승인 확인"
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 bg-black/30 flex items-center justify-center"
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
    >
      <div className="bg-white rounded-xl border border-gray-50 p-6 max-w-sm w-full">
        <h2 className="text-lg font-bold text-gray-900 mb-3">납부 일괄 승인</h2>
        <p className="text-sm text-gray-400 mb-2">
          {count}명의 납부를 승인합니다.
        </p>
        <p className="text-xs text-gray-300 mb-6">
          이 작업은 되돌릴 수 없습니다.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            color="neutral"
            size="md"
            onClick={() => close(false)}
          >
            취소
          </Button>
          <Button
            variant="filled"
            color="primary"
            size="md"
            onClick={() => close(true)}
          >
            승인
          </Button>
        </div>
      </div>
    </Modal>
  );
}
