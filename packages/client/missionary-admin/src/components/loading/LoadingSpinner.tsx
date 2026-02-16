interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({
  message = '불러오는 중...',
}: LoadingSpinnerProps) {
  return (
    <div role="status" className="flex items-center justify-center flex-1">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-30 border-t-gray-60 rounded-full animate-spin" />
        <p className="text-sm text-gray-50">{message}</p>
      </div>
    </div>
  );
}
