'use client';

import { useAuth } from 'lib/auth/AuthContext';
import { useSidebar } from 'lib/sidebar/SidebarContext';
import {
  FileText,
  Globe,
  Hexagon,
  LogOut,
  MapPin,
  Megaphone,
  ShieldCheck,
  User,
} from 'lucide-react';
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
    icon: <Globe size={20} />,
  },
  {
    label: '유저 관리',
    href: '/users',
    icon: <User size={20} />,
  },
  {
    label: '연계지 관리',
    href: '/regions',
    icon: <MapPin size={20} />,
  },
  {
    label: '게시 관리',
    href: '/posts',
    icon: <FileText size={20} />,
  },
  {
    label: '약관 관리',
    href: '/terms',
    icon: <ShieldCheck size={20} />,
  },
  {
    label: '공지 관리',
    href: '/notices',
    icon: <Megaphone size={20} />,
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
  const { isOpen, close } = useSidebar();

  const initial = user.email?.charAt(0).toUpperCase() ?? 'A';

  return (
    <>
      {/* Overlay (mobile only) */}
      <div
        className={`fixed inset-0 z-20 bg-black/40 transition-opacity duration-300 ease-in-out lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
        aria-hidden="true"
      />
      <aside
        className={`fixed top-0 left-0 z-30 flex flex-col w-[260px] h-screen bg-white border-r border-gray-30 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:z-10`}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50">
              <Hexagon
                size={18}
                className="text-white"
                fill="white"
                fillOpacity={0.9}
              />
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
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
