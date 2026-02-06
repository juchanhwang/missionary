'use client';

import { useState } from 'react';

interface SubMenu {
  label: string;
  href: string;
}

interface MenuGroup {
  label: string;
  subMenus: SubMenu[];
}

const MENU_DATA: MenuGroup[] = [
  {
    label: '국내선교',
    subMenus: [
      { label: '제주선교', href: '#' },
      { label: '군선교', href: '#' },
    ],
  },
  {
    label: '해외선교',
    subMenus: [],
  },
  {
    label: '선교 관리',
    subMenus: [],
  },
];

function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="6"
      viewBox="0 0 12 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L6 5L11 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Sidebar() {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(
    new Set(['국내선교']),
  );

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <aside className="fixed top-0 left-0 z-10 flex flex-col w-[260px] h-screen bg-primary-30">
      <div className="w-[260px] h-[100px]">
        <img
          src="/logo-sidebar.svg"
          alt="선교 상륙 작전"
          className="w-full h-full"
        />
      </div>
      <div className="w-[260px] h-[4px] bg-gray-95" />
      <nav className="flex flex-col flex-1 overflow-y-auto">
        {MENU_DATA.map((group) => {
          const expanded = expandedMenus.has(group.label);

          return (
            <div key={group.label}>
              <button
                type="button"
                onClick={() => toggleMenu(group.label)}
                className="relative flex items-center w-[260px] h-[55px] px-[20px] border-0 border-b border-gray-95 bg-transparent text-white font-inherit text-[16px] font-normal leading-[1.375] text-left cursor-pointer hover:bg-white/5"
              >
                {group.label}
                {group.subMenus.length > 0 && (
                  <span
                    className={`absolute right-[16px] flex items-center justify-center w-[24px] h-[24px] transition-transform duration-200 text-white ${
                      expanded ? 'rotate-180' : 'rotate-0'
                    }`}
                  >
                    <ChevronDownIcon />
                  </span>
                )}
              </button>
              {expanded &&
                group.subMenus.map((sub) => (
                  <button
                    key={sub.label}
                    type="button"
                    className="flex items-center w-[260px] h-[55px] px-[24px] border-0 border-b border-gray-95 bg-white/8 text-primary-20 font-inherit text-[16px] font-normal leading-[1.375] text-left cursor-pointer hover:bg-white/12"
                  >
                    {sub.label}
                  </button>
                ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
