'use client';

import { Plus } from 'lucide-react';

interface AddFieldButtonProps {
  onClick: () => void;
}

export function AddFieldButton({ onClick }: AddFieldButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white py-4 text-sm font-medium text-gray-400 transition-colors cursor-pointer hover:border-gray-400 hover:bg-gray-50 hover:text-gray-600"
    >
      <Plus size={16} />
      필드 추가
    </button>
  );
}
