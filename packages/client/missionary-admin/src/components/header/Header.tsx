'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';

const PAGE_TITLES: Record<string, string> = {
  '/': '대시보드',
  '/missions': '선교 관리',
  '/users': '유저 관리',
  '/regions': '연계지 관리',
  '/posts': '게시 관리',
  '/terms': '약관 관리',
  '/notices': '공지 관리',
};

function getPageTitle(pathname: string): string {
  for (const [path, title] of Object.entries(PAGE_TITLES)) {
    if (path === '/' && pathname === '/') return title;
    if (path !== '/' && pathname.startsWith(path)) return title;
  }
  return '대시보드';
}

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="flex items-center justify-between w-full h-16 px-8 bg-white border-b border-gray-30">
      <h1 className="text-xl font-semibold text-gray-90">{title}</h1>

      <div className="relative w-64">
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-50"
        >
          <circle
            cx="8"
            cy="8"
            r="5.25"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M12 12L16 16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="검색..."
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-10 text-sm text-gray-90 placeholder:text-gray-50 border border-transparent focus:border-gray-40 focus:outline-none transition-colors"
        />
      </div>
    </header>
  );
}
