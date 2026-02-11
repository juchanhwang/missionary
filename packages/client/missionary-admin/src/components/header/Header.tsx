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
    <header className="relative flex items-center w-full h-16 bg-white border-b border-gray-10">
      <span className="absolute left-10 top-1/2 -translate-y-1/2 text-lg font-semibold leading-snug text-gray-90">
        {statusText}
      </span>
      <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-4">
        {user && (
          <span className="text-sm font-medium leading-normal text-gray-50">
            {user.email}
          </span>
        )}
        <button
          type="button"
          onClick={logout}
          className="px-3 py-1.5 rounded-md border border-gray-30 text-sm text-gray-60 hover:bg-gray-10 transition-colors"
        >
          로그아웃
        </button>
        <IconButton
          type="button"
          variant="ghost"
          icon={<img src="/icon-home.svg" alt="" className="w-6 h-6" />}
          label="홈으로"
        />
      </div>
    </header>
  );
}
