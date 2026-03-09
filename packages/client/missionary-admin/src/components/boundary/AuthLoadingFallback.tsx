'use client';

export function AuthLoadingFallback() {
  return (
    <div
      role="status"
      className="flex justify-center items-center h-screen w-full bg-gray-50"
    >
      <div className="w-10 h-10 border-[3px] border-gray-100 border-t-gray-700 rounded-full animate-spin" />
      <span className="sr-only">인증 정보를 불러오는 중입니다</span>
    </div>
  );
}
