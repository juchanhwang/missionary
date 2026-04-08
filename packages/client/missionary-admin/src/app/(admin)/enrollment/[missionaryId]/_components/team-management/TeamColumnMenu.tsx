'use client';

import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { Team } from 'apis/team';

interface TeamColumnMenuProps {
  team: Team;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * 팀 컬럼 헤더의 드롭다운 메뉴. ui-spec §4-3, mockup Screen 2.
 *
 * 책임:
 * - 메뉴 열림/닫힘 상태머신 (toggle, outside click, Esc)
 * - 메뉴 트리거 버튼(Ellipsis) + 드롭다운 패널 UI
 *
 * `TeamColumnHeader`에서 분리되어 헤더 표시 책임과 메뉴 인터랙션 책임을 분리한다.
 * 외부 클릭/Esc 닫힘 이펙트는 단일 컬럼에만 관여하므로 인라인 유지.
 */
export function TeamColumnMenu({
  team,
  onEdit,
  onDelete,
}: TeamColumnMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasMenu = Boolean(onEdit || onDelete);

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
  );
}
