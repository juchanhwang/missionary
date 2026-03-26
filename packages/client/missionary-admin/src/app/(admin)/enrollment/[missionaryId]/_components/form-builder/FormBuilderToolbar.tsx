'use client';

import { Button } from '@samilhero/design-system';
import { Loader2 } from 'lucide-react';

interface FormBuilderToolbarProps {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export function FormBuilderToolbar({
  isDirty,
  isSaving,
  onSave,
}: FormBuilderToolbarProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-900">커스텀 폼 필드</h3>
        {isDirty && (
          <span className="inline-flex items-center rounded-full bg-warning-10 px-2 py-0.5 text-xs font-medium text-warning-70">
            미저장
          </span>
        )}
      </div>
      <Button
        variant="filled"
        color="primary"
        size="sm"
        onClick={onSave}
        disabled={!isDirty || isSaving}
      >
        {isSaving && <Loader2 size={14} className="animate-spin" />}
        저장
      </Button>
    </div>
  );
}
