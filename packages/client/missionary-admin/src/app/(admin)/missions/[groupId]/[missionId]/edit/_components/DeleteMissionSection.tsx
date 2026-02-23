'use client';

import { openOverlayAsync } from '@samilhero/design-system';
import { Ellipsis, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';

import { DeleteConfirmModal } from './DeleteConfirmModal';
import { deleteMissionaryAction } from '../_actions/missionaryActions';

interface DeleteMissionSectionProps {
  missionaryId: string;
  missionaryName: string;
  missionGroupId: string;
}

export function DeleteMissionSection({
  missionaryId,
  missionaryName,
  missionGroupId,
}: DeleteMissionSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleDelete = async () => {
    setIsOpen(false);

    const confirmed = await openOverlayAsync<boolean>(({ isOpen, close }) => (
      <DeleteConfirmModal
        isOpen={isOpen}
        close={close}
        missionaryName={missionaryName}
        isPending={isPending}
      />
    ));

    if (confirmed) {
      startTransition(async () => {
        await deleteMissionaryAction(missionaryId, missionGroupId);
      });
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-30 bg-white text-gray-60 hover:bg-gray-10 hover:border-gray-40 transition-colors"
        aria-label="더보기"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Ellipsis size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-10 min-w-[140px] rounded-lg border border-gray-30 bg-white p-1 shadow-lg">
          <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} />
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
