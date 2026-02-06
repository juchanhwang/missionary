'use client';

import { useAuth } from 'lib/auth/AuthContext';

interface HeaderProps {
  statusText?: string;
}

export function Header({
  statusText = '진행중인 선교 : 선교를 생성 해주세요.',
}: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="relative flex items-center w-full h-[100px] bg-white">
      <span className="absolute left-[40px] top-1/2 -translate-y-1/2 text-[28px] font-bold leading-[1.214] text-primary-20">
        {statusText}
      </span>
      <div className="absolute right-[40px] top-1/2 -translate-y-1/2 flex items-center gap-[16px]">
        {user && (
          <span className="text-[14px] font-medium leading-[1.43] text-gray-40">
            {user.email}
          </span>
        )}
        <button
          type="button"
          onClick={logout}
          className="px-[12px] py-[6px] border border-gray-90 rounded-[6px] bg-transparent text-[13px] font-medium font-inherit leading-[1.38] text-gray-40 cursor-pointer hover:bg-gray-98"
        >
          로그아웃
        </button>
        <button
          type="button"
          className="flex items-center gap-[4px] p-0 border-0 bg-transparent cursor-pointer"
        >
          <img src="/icon-home.svg" alt="" className="w-[34px] h-[34px]" />
          <span className="text-[28px] font-bold leading-[1.214] text-black">
            홈으로
          </span>
        </button>
      </div>
    </header>
  );
}
