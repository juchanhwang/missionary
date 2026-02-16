'use client';

export function AuthLoadingFallback() {
  return (
    <div
      role="status"
      className="flex justify-center items-center h-screen w-full bg-gray-10"
    >
      <div className="w-10 h-10 border-[3px] border-gray-20 border-t-gray-70 rounded-full animate-spin" />
      <span className="sr-only">인증 정보를 불러오는 중입니다</span>
    </div>
  );
}
