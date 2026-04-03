'use client';

import { Button } from '@samilhero/design-system';
import { useEffect } from 'react';
import Modal from 'react-modal';

interface PauseConfirmModalProps {
  isOpen: boolean;
  close: (confirmed: boolean) => void;
}

export function PauseConfirmModal({ isOpen, close }: PauseConfirmModalProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('body');
    }
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => close(false)}
      contentLabel="등록 일시 중지 확인"
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 bg-black/40 flex items-center justify-center"
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-clip">
        <div className="px-6 pt-6 pb-5">
          <h3
            id="pause-modal-title"
            className="text-base font-semibold text-gray-900 mb-3"
          >
            등록을 일시 중지하시겠습니까?
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            중지하면 새로운 등록 제출이 차단됩니다.
            <br />
            기존 등록 데이터에는 영향이 없습니다.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <Button
            variant="outline"
            color="neutral"
            size="sm"
            onClick={() => close(false)}
          >
            취소
          </Button>
          <button
            className="px-4 py-1.5 rounded-md bg-red-500 text-sm font-medium text-white hover:bg-red-600"
            onClick={() => close(true)}
          >
            일시 중지
          </button>
        </div>
      </div>
    </Modal>
  );
}
