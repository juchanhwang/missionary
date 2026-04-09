'use client';

import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core';

import {
  KANBAN_SCREEN_READER_INSTRUCTIONS,
  buildKanbanAnnouncements,
} from './_utils/kanbanAccessibility';
import { DragOverlayCard } from './DragOverlayCard';
import { useKanbanDnd } from './useKanbanDnd';

import type { GroupedParticipations } from './types';
import type { Team } from 'apis/team';
import type { ReactNode } from 'react';

interface KanbanBoardProps {
  /** 스크린리더 안내 lookup에서 팀 이름 변환에 사용한다. */
  teams: Team[];
  /** DnD source 및 active 카드 lookup에 사용한다. */
  grouped: GroupedParticipations;
  /** 드롭 결과로 mutation을 수행하는 상위 핸들러. */
  onAssignTeam?: (participationId: string, teamId: string | null) => void;
  /**
   * 보드 내부에 렌더될 콘텐츠. 일반적으로 `UnassignedSidebar` + 팀 컬럼 영역을
   * 합성 패턴으로 주입한다. `KanbanBoard`는 배치 결정을 하지 않고 pass-through만 한다.
   */
  children: ReactNode;
}

/**
 * 칸반 보드 DnD 콘텍스트 셸. fe-plan v1.2 §3-1, §3-3, ui-spec §3-2.
 *
 * 이 컴포넌트는 **DnD 전담**이다. 좌/우 영역의 조합은 상위
 * (`TeamManagementSection`)가 결정하여 `children`으로 합성한다 —
 * 슬롯 props 안티패턴을 피하고 JSX 합성으로 표현한다.
 *
 * 책임:
 * - `DndContext` 세팅 (sensors, collisionDetection, accessibility)
 * - 드래그 중인 카드를 `DragOverlay`로 포인터에 고정 렌더
 *
 * 위임:
 * - DnD state machine → `useKanbanDnd` 훅
 * - 스크린리더 한국어 안내 → `_utils/kanbanAccessibility`
 * - overlay UI → `DragOverlayCard` 컴포넌트
 *
 * 이 컴포넌트가 알 **필요 없는** 것:
 * - 팀 생성/수정/삭제 콜백 (→ children 내부 컴포넌트에 직접 주입)
 * - 필터 빈 상태 여부 (→ 상위에서 children 트리를 교체)
 */
export function KanbanBoard({
  teams,
  grouped,
  onAssignTeam,
  children,
}: KanbanBoardProps) {
  const {
    sensors,
    activeParticipation,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useKanbanDnd({ grouped, onAssignTeam });

  const announcements = buildKanbanAnnouncements(teams, grouped);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      accessibility={{
        announcements,
        screenReaderInstructions: KANBAN_SCREEN_READER_INSTRUCTIONS,
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        data-testid="kanban-board"
        className="flex flex-row flex-1 gap-4 min-h-0"
      >
        {children}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeParticipation ? (
          <DragOverlayCard participation={activeParticipation} teams={teams} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
