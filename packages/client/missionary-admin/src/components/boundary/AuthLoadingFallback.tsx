'use client';

export function AuthLoadingFallback() {
  return (
    <div className="flex justify-center items-center h-screen w-full bg-gray-02">
      <div className="w-12 h-12 border-4 border-gray-10 border-t-primary-60 rounded-full animate-spin" />
    </div>
  );
}
