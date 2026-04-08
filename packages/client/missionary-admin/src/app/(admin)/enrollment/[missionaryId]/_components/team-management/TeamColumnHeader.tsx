'use client';

import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { Team } from 'apis/team';

interface TeamColumnHeaderProps {
  team: Team;
  memberCount: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * 팀 컬럼 헤더. ui-spec §4-3, mockup Screen 2.
 *
 * 표시:
 * - 팀명 + 인원 수
 * - 팀장명 · 연계지명
 * - 메뉴 버튼 (Ellipsis) → 수정/삭제 드롭다운 메뉴
 *
 * 드롭다운: 외부 클릭 / Esc 키로 닫힘. 단일 컬럼에만 관여하므로 경량 구현.
 */
export function TeamColumnHeader({
  team,
  memberCount,
  onEdit,
  onDelete,
}: TeamColumnHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasMenu = Boolean(onEdit || onDelete);

  const regionName = team.missionaryRegion?.name ?? null;
  const subText =
    regionName !== null
      ? `${team.leaderUserName} · ${regionName}`
      : team.leaderUserName;

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  return (
    <header className="flex items-start justify-between gap-2 px-3 pt-3 pb-2 border-b border-gray-100">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[13px] font-semibold text-gray-900 truncate">
            {team.teamName}
          </h3>
          <span
            data-testid={`team-member-count-${team.id}`}
            className="text-xs font-semibold text-gray-500"
          >
            {memberCount}명
          </span>
        </div>
        <p className="text-[11px] text-gray-400 truncate mt-0.5">{subText}</p>
      </div>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          aria-label={`${team.teamName} 메뉴`}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          data-testid={`team-column-menu-${team.id}`}
          disabled={!hasMenu}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Ellipsis size={16} aria-hidden />
        </button>

        {isMenuOpen && hasMenu && (
          <div
            role="menu"
            data-testid={`team-column-menu-list-${team.id}`}
            className="absolute right-0 top-full z-10 mt-1 w-32 rounded-lg border border-gray-100 bg-white py-1 shadow-md"
          >
            {onEdit && (
              <button
                type="button"
                role="menuitem"
                data-testid={`team-column-edit-${team.id}`}
                onClick={() => {
                  setIsMenuOpen(false);
                  onEdit();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50"
              >
                <Pencil size={12} aria-hidden />팀 수정
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                role="menuitem"
                data-testid={`team-column-delete-${team.id}`}
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50"
              >
                <Trash2 size={12} aria-hidden />팀 삭제
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
