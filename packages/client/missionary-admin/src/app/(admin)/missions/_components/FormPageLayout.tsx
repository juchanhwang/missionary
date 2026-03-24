'use client';

import { Button } from '@samilhero/design-system';

interface FormPageLayoutProps {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  title: string;
  description?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  onCancel: () => void;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  submitDisabled?: boolean;
}

export function FormPageLayout({
  onSubmit,
  title,
  description,
  headerAction,
  children,
  onCancel,
  submitLabel,
  pendingLabel,
  isPending,
  submitDisabled,
}: FormPageLayoutProps) {
  const isDisabled = submitDisabled ?? isPending;

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col flex-1 p-8 gap-5 overflow-y-auto"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {description && (
            <p className="text-sm text-gray-400">{description}</p>
          )}
        </div>
        {headerAction}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {children}
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          color="neutral"
          variant="outline"
          size="md"
          onClick={onCancel}
        >
          취소
        </Button>
        <Button type="submit" disabled={isDisabled} size="md">
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
