interface LoadingSpinnerProps {
  message?: string;
  fullscreen?: boolean;
}

export function LoadingSpinner({
  message = '불러오는 중...',
  fullscreen = false,
}: LoadingSpinnerProps) {
  if (fullscreen) {
    return (
      <div
        role="status"
        className="flex justify-center items-center h-screen w-full bg-gray-50"
      >
        <div className="w-10 h-10 border-[3px] border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  return (
    <div role="status" className="flex items-center justify-center flex-1">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">{message}</p>
      </div>
    </div>
  );
}
