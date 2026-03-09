interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({
  message = '불러오는 중...',
}: LoadingSpinnerProps) {
  return (
    <div role="status" className="flex items-center justify-center flex-1">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">{message}</p>
      </div>
    </div>
  );
}
