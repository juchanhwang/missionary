'use client';

import { useSidebar } from 'lib/sidebar/SidebarContext';
import { Menu, Search } from 'lucide-react';
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
  const { toggle } = useSidebar();

  return (
    <header className="flex items-center justify-between w-full h-16 px-4 lg:px-8 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors lg:hidden"
          aria-label="메뉴 열기"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="relative w-64">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="검색..."
          aria-label="검색"
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 border border-transparent focus:border-gray-300 focus:outline-none transition-colors"
        />
      </div>
    </header>
  );
}
