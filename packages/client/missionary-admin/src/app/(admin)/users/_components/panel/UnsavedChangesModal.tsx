'use client';

import { Button } from '@samilhero/design-system';
import { useEffect } from 'react';
import Modal from 'react-modal';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  close: (confirmed: boolean) => void;
}

export function UnsavedChangesModal({
  isOpen,
  close,
}: UnsavedChangesModalProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('body');
    }
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => close(false)}
      contentLabel="변경사항 확인"
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 z-40 bg-black/30 flex items-center justify-center"
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
    >
      <div className="bg-white rounded-xl border border-gray-50 p-6 max-w-sm w-full">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          변경사항이 있습니다
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          저장하지 않은 변경사항이 있습니다. 그래도 닫으시겠습니까?
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
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  );
}
