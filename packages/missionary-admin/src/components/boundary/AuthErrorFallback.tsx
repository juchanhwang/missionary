'use client';

import { type FallbackProps } from 'react-error-boundary';

export function AuthErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const errorMessage =
    error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';

  return (
    <div className="flex flex-col justify-center items-center h-screen w-full bg-[#f5f5f5] gap-[16px]">
      <h2 className="text-[24px] text-[#333] m-0">인증 오류</h2>
      <p className="text-[14px] text-[#666] m-0">{errorMessage}</p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="px-[24px] py-[12px] text-[14px] text-white bg-[#1976d2] border-none rounded-[8px] cursor-pointer hover:bg-[#1565c0]"
      >
        다시 시도
      </button>
    </div>
  );
}
