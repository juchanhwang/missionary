'use client';

import {
  ArrowRightFromLine,
  ChevronDown,
  ChevronUp,
  Ellipsis,
  Loader2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const PANEL_TRANSITION_MS = 300;

export interface SidePanelMenuItem {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onExited: () => void;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  onPrev?: (() => void) | null;
  onNext?: (() => void) | null;
  menuItems?: SidePanelMenuItem[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  children: React.ReactNode;
}

export function SidePanel({
  isOpen,
  onClose,
  onExited,
  title,
  subtitle,
  badge,
  onPrev,
  onNext,
  menuItems,
  isLoading,
  isError,
  errorMessage = '정보를 불러오는 중 오류가 발생했습니다',
  children,
}: SidePanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasExitedRef = useRef(false);

  // 마운트 시 slide-in
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  // isOpen이 false로 바뀌면 slide-out 트리거
  if (!isOpen && isVisible) {
    setIsVisible(false);
  }

  // 메뉴 외부 클릭 감지
  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.propertyName === 'translate' && !isVisible && !hasExitedRef.current) {
      hasExitedRef.current = true;
      onExited();
    }
  };

  // transitionend 미발생 폴백 (prefers-reduced-motion 등)
  useEffect(() => {
    if (!isVisible && !isOpen) {
      const timer = setTimeout(() => {
        if (!hasExitedRef.current) {
          hasExitedRef.current = true;
          onExited();
        }
      }, PANEL_TRANSITION_MS + 50);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isOpen, onExited]);

  const showNav = onPrev !== undefined || onNext !== undefined;
  const showMenu = menuItems && menuItems.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-20"
        onClick={isOpen ? onClose : undefined}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="side-panel-title"
        className={`fixed right-0 top-0 h-full w-[560px] z-30 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="flex h-full flex-col bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.08),-1px_0_4px_rgba(0,0,0,0.04)]">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          ) : isError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3">
              <p className="text-sm text-error-60">{errorMessage}</p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
                    title="패널 닫기"
                  >
                    <ArrowRightFromLine size={18} />
                  </button>
                  <div className="flex items-center gap-2">
                    <h3
                      id="side-panel-title"
                      className="text-sm font-semibold text-gray-900"
                    >
                      {title}
                    </h3>
                    {badge}
                  </div>
                  {subtitle && (
                    <span className="text-xs text-gray-400">{subtitle}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {showNav && (
                    <>
                      <button
                        type="button"
                        onClick={onPrev ?? undefined}
                        disabled={!onPrev}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:pointer-events-none"
                        title="이전"
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={onNext ?? undefined}
                        disabled={!onNext}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:pointer-events-none"
                        title="다음"
                      >
                        <ChevronDown size={18} />
                      </button>
                    </>
                  )}
                  {showMenu && (
                    <div className="relative" ref={menuRef}>
                      <button
                        type="button"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        aria-expanded={isMenuOpen}
                        aria-haspopup="menu"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
                      >
                        <Ellipsis size={18} />
                      </button>
                      {isMenuOpen && (
                        <div
                          role="menu"
                          className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                        >
                          {menuItems.map((item) => (
                            <button
                              key={item.label}
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setIsMenuOpen(false);
                                item.onClick();
                              }}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                                item.variant === 'destructive'
                                  ? 'text-error-60 hover:bg-error-10'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              {children}
            </>
          )}
        </div>
      </aside>
    </>
  );
}

export { PANEL_TRANSITION_MS };
