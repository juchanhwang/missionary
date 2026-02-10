'use client';

import { IconButton } from '@samilhero/design-system';
import { useAuth } from 'lib/auth/AuthContext';

interface HeaderProps {
  statusText?: string;
}

export function Header({
  statusText = '진행중인 선교 : 선교를 생성 해주세요.',
}: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="relative flex items-center w-full h-24 bg-white">
      <span className="absolute left-10 top-1/2 -translate-y-1/2 text-[28px] font-bold leading-snug text-primary-80">
        {statusText}
      </span>
      <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-4">
        {user && (
          <span className="text-sm font-medium leading-normal text-gray-60">
            {user.email}
          </span>
        )}
        <button
          type="button"
          onClick={logout}
          className="px-3 py-1.5 rounded-md border border-gray-10 text-sm text-gray-60 hover:bg-gray-02 transition-colors"
        >
          로그아웃
        </button>
        <IconButton
          type="button"
          variant="ghost"
          icon={<img src="/icon-home.svg" alt="" className="w-8 h-8" />}
          label="홈으로"
        />
      </div>
    </header>
  );
}
