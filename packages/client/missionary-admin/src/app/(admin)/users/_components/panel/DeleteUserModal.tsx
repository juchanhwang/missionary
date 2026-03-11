'use client';

import { Button } from '@samilhero/design-system';
import axios from 'axios';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';

import { useDeleteUserAction } from '../../_hooks/useDeleteUserAction';

export interface DeleteUserModalProps {
  isOpen: boolean;
  close: (result: boolean) => void;
  userId: string;
  userName: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  CANNOT_DELETE_SELF: '자기 자신은 삭제할 수 없습니다.',
  LAST_ADMIN: '마지막 관리자는 삭제할 수 없습니다.',
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const code = error.response?.data?.code as string | undefined;
    if (code && ERROR_MESSAGES[code]) {
      return ERROR_MESSAGES[code];
    }
    const message = error.response?.data?.message as string | undefined;
    if (message) {
      return message;
    }
  }
  return '유저 삭제 중 오류가 발생했습니다.';
}

export function DeleteUserModal({
  isOpen,
  close,
  userId,
  userName,
}: DeleteUserModalProps) {
  const { mutate, isPending } = useDeleteUserAction();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Modal.setAppElement('body');
    }
  }, []);

  const handleAfterOpen = () => {
    setErrorMessage(null);
  };

  const handleConfirm = () => {
    setErrorMessage(null);
    mutate(userId, {
      onSuccess: () => {
        close(true);
      },
      onError: (error) => {
        setErrorMessage(getErrorMessage(error));
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onAfterOpen={handleAfterOpen}
      onRequestClose={() => close(false)}
      contentLabel="유저 삭제 확인"
      className="fixed inset-0 flex items-center justify-center p-4"
      overlayClassName="fixed inset-0 bg-black/30 flex items-center justify-center"
      shouldCloseOnEsc={!isPending}
      shouldCloseOnOverlayClick={!isPending}
    >
      <div className="bg-white rounded-xl border border-gray-50 p-6 max-w-sm w-full">
        <h2 className="text-lg font-bold text-gray-900 mb-3">유저 삭제</h2>
        <p className="text-sm text-gray-400 mb-2">
          정말 &apos;{userName}&apos; 유저를 삭제하시겠습니까?
        </p>
        <p className="text-xs text-gray-300 mb-6">30일 후 영구 삭제됩니다.</p>
        {errorMessage && (
          <p className="text-sm text-error-60 mb-4">{errorMessage}</p>
        )}
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
            삭제
          </Button>
        </div>
      </div>
    </Modal>
  );
}
