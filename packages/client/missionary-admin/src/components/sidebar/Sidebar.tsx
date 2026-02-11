'use client';

import { NavItem } from '@samilhero/design-system';
import { useQuery } from '@tanstack/react-query';
import { type MissionGroup } from 'apis/missionGroup';
import { missionGroupApi } from 'apis/missionGroup';
import { queryKeys } from 'lib/queryKeys';
import { useState } from 'react';

interface SubMenu {
  label: string;
  href: string;
}

interface MenuGroup {
  label: string;
  href?: string;
  subMenus: SubMenu[];
}

function useSidebarMissionGroups() {
  return useQuery({
    queryKey: queryKeys.missionGroups.list(),
    queryFn: async () => {
      const response = await missionGroupApi.getMissionGroups();
      return response.data;
    },
  });
}

function buildMenuFromGroups(groups: MissionGroup[] | undefined): MenuGroup[] {
  const domesticGroups = groups?.filter((g) => g.type === 'DOMESTIC') ?? [];
  const abroadGroups = groups?.filter((g) => g.type === 'ABROAD') ?? [];

  return [
    {
      label: '국내선교',
      href: '/missions',
      subMenus: domesticGroups.map((g) => ({
        label: g.name,
        href: `/missions/${g.id}`,
      })),
    },
    {
      label: '해외선교',
      href: '/missions',
      subMenus: abroadGroups.map((g) => ({
        label: g.name,
        href: `/missions/${g.id}`,
      })),
    },
    {
      label: '선교 관리',
      subMenus: [],
    },
  ];
}

export function Sidebar() {
  const { data: missionGroups } = useSidebarMissionGroups();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(
    new Set(['국내선교']),
  );

  const MENU_DATA = buildMenuFromGroups(missionGroups);

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
    <aside className="fixed top-0 left-0 z-10 flex flex-col w-[260px] h-screen bg-primary-70">
      <div className="w-[260px] h-[100px]">
        <img
          src="/logo-sidebar.svg"
          alt="선교 상륙 작전"
          className="w-full h-full"
        />
      </div>
      <div className="w-[260px] h-[4px] bg-gray-05" />
      <nav className="flex flex-col flex-1 overflow-y-auto">
        {MENU_DATA.map((group) => {
          const expanded = expandedMenus.has(group.label);

          return (
            <div key={group.label}>
              <NavItem
                label={group.label}
                onClick={() => toggleMenu(group.label)}
                hasChildren={group.subMenus.length > 0}
                isExpanded={expanded}
                depth={0}
                className="w-[260px] border-b border-gray-05"
              />
              {expanded &&
                group.subMenus.map((sub) => (
                  <NavItem
                    key={sub.label}
                    label={sub.label}
                    href={sub.href}
                    depth={1}
                    className="w-[260px] border-b border-gray-05"
                  />
                ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
