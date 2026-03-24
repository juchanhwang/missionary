'use client';

import { Button } from '@samilhero/design-system';
import { useEffect, useEffectEvent, useRef } from 'react';

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  close: (confirmed: boolean) => void;
  missionaryName: string;
  isPending?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  close,
  missionaryName,
  isPending = false,
}: DeleteConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const onClose = useEffectEvent((confirmed: boolean) => {
    close(confirmed);
  });

  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    document.body.inert = true;

    const dialog = dialogRef.current;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled])',
    );
    focusable[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose(false);
        return;
      }

      if (e.key !== 'Tab') return;

      const current = dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled])',
      );
      const first = current[0];
      const last = current[current.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    dialog.addEventListener('keydown', handleKeyDown);
    return () => {
      dialog.removeEventListener('keydown', handleKeyDown);
      document.body.inert = false;
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => close(false)}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        className="bg-white rounded-xl border border-gray-50 p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="delete-confirm-title"
          className="text-lg font-bold text-gray-900 mb-3"
        >
          선교 삭제
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          정말 &apos;{missionaryName}&apos; 선교를 삭제하시겠습니까?
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
            onClick={() => close(true)}
            disabled={isPending}
          >
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
}
