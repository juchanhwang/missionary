'use client';

import { useAuth } from 'lib/auth/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItemConfig {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItemConfig[] = [
  {
    label: '선교 관리',
    href: '/missions',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="10"
          cy="10"
          r="7.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M10 2.75C10 2.75 13 6 13 10C13 14 10 17.25 10 17.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M10 2.75C10 2.75 7 6 7 10C7 14 10 17.25 10 17.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M3 10H17"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: '유저 관리',
    href: '/users',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="10"
          cy="7"
          r="3.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M3.5 17.25C3.5 14.35 6.41 12 10 12C13.59 12 16.5 14.35 16.5 17.25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: '연계지 관리',
    href: '/regions',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 10.5C11.1046 10.5 12 9.60457 12 8.5C12 7.39543 11.1046 6.5 10 6.5C8.89543 6.5 8 7.39543 8 8.5C8 9.60457 8.89543 10.5 10 10.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M10 17.25L14.95 12.3C17.6833 9.56667 17.6833 5.43333 14.95 2.7C12.2167 -0.0333333 7.78333 -0.0333333 5.05 2.7C2.31667 5.43333 2.31667 9.56667 5.05 12.3L10 17.25Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: '게시 관리',
    href: '/posts',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="3.75"
          y="2.75"
          width="12.5"
          height="14.5"
          rx="1.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M7 7H13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M7 10H13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M7 13H10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: '약관 관리',
    href: '/terms',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 1.75L16.25 4.5V9.5C16.25 13.5 13.5 16.75 10 18.25C6.5 16.75 3.75 13.5 3.75 9.5V4.5L10 1.75Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M7.5 10L9.25 11.75L12.5 8.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: '공지 관리',
    href: '/notices',
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 7.5V4.5L4 8V9L5.5 9.5V13.5L7 14V9.75L15 7.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M15 4.5C15 4.5 17 5.5 17 7.5C17 9.5 15 10.5 15 10.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="15" cy="7.5" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
];

function SidebarNavItem({
  item,
  isActive,
}: {
  item: NavItemConfig;
  isActive: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={`
        relative flex items-center gap-3 h-11 mx-3 px-3 rounded-lg
        text-sm font-medium transition-colors duration-150
        ${
          isActive
            ? 'bg-gray-20 text-gray-90'
            : 'text-gray-60 hover:bg-gray-10 hover:text-gray-80'
        }
      `}
    >
      {isActive && (
        <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary-50" />
      )}
      <span className="shrink-0">{item.icon}</span>
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initial = user.email?.charAt(0).toUpperCase() ?? 'A';

  return (
    <aside className="fixed top-0 left-0 z-10 flex flex-col w-[260px] h-screen bg-white border-r border-gray-30">
      {/* Logo */}
      <div className="flex items-center h-16 px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 1L16 5V13L9 17L2 13V5L9 1Z"
                fill="white"
                fillOpacity="0.9"
              />
              <path d="M9 1L16 5L9 9L2 5L9 1Z" fill="white" />
            </svg>
          </div>
          <span className="text-base font-bold text-gray-90 tracking-tight">
            선교 관리 시스템
          </span>
        </div>
      </div>

      <div className="mx-4 h-px bg-gray-30" />

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto py-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <SidebarNavItem key={item.href} item={item} isActive={isActive} />
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-30 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-80 text-white text-sm font-semibold shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-90 truncate">
              {user.email}
            </p>
            <p className="text-xs text-gray-50 capitalize">{user.role}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="shrink-0 p-1.5 rounded-md text-gray-50 hover:text-gray-80 hover:bg-gray-20 transition-colors"
            aria-label="로그아웃"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.75 15.75H3.75C3.35218 15.75 2.97064 15.592 2.68934 15.3107C2.40804 15.0294 2.25 14.6478 2.25 14.25V3.75C2.25 3.35218 2.40804 2.97064 2.68934 2.68934C2.97064 2.40804 3.35218 2.25 3.75 2.25H6.75"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 12.75L15.75 9L12 5.25"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.75 9H6.75"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
