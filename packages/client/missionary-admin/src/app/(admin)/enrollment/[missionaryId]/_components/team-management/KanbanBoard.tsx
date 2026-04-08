'use client';

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
  type ScreenReaderInstructions,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState, type ReactNode } from 'react';

import { resolveDropAssignment } from './_utils/resolveDropAssignment';

import type { DragData, DropData, GroupedParticipations } from './types';
import type { Participation } from 'apis/participation';
import type { Team } from 'apis/team';

interface KanbanBoardProps {
  /** 스크린리더 안내 lookup에서 팀 이름 변환에 사용한다. */
  teams: Team[];
  /** DnD source 및 active 카드 lookup에 사용한다. */
  grouped: GroupedParticipations;
  /** 드롭 결과로 mutation을 수행하는 상위 핸들러. */
  onAssignTeam?: (participationId: string, teamId: string | null) => void;
  /** 좌측 슬롯 — 보통 `UnassignedSidebar`. */
  sidebar: ReactNode;
  /** 우측 슬롯 — 보통 `TeamColumnGrid` 또는 `TeamFilterEmptyState`. */
  columns: ReactNode;
}

/**
 * 칸반 보드 DnD 콘텍스트 셸. fe-plan v1.2 §3-1, §3-3, ui-spec §3-2.
 *
 * 이 컴포넌트는 **DnD 전담**이다. 좌/우 영역의 조합은 상위
 * (`TeamManagementSection`)가 결정하여 `sidebar`/`columns` 슬롯으로 주입한다.
 *
 * 책임:
 * - `DndContext` 세팅 (sensors, collisionDetection, accessibility)
 * - 드래그 라이프사이클(`onDragStart`/`onDragEnd`/`onDragCancel`)에서
 *   `activeParticipation` 추적 및 `onAssignTeam` 위임
 * - `DragOverlay`로 드래그 중인 카드를 포인터에 고정 렌더
 * - 스크린리더 한국어 안내 (`buildKanbanAnnouncements`)
 *
 * 이 컴포넌트가 알 **필요 없는** 것:
 * - 팀 생성/수정/삭제 콜백 (→ 우측 슬롯에 직접 주입)
 * - 필터 빈 상태 여부 (→ 상위에서 우측 슬롯을 교체)
 *
 * 센서:
 * - PointerSensor (activationConstraint: 8px 이동) — 클릭과 드래그 구분
 * - KeyboardSensor — Space로 pick up, 방향키로 이동, Enter로 drop, Esc로 cancel (a11y)
 *
 * 드롭 룰:
 * - over가 null이거나 출발지와 같으면 noop
 * - `over.id === 'unassigned'` → teamId = null
 * - `over.id === 'team-{id}'` → teamId = {id}
 */
export function KanbanBoard({
  teams,
  grouped,
  onAssignTeam,
  sidebar,
  columns,
}: KanbanBoardProps) {
  const [activeParticipation, setActiveParticipation] =
    useState<Participation | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined;
    if (!data) return;
    const source =
      grouped.unassigned.find((p) => p.id === data.participationId) ??
      findInTeams(grouped.byTeamId, data.participationId);
    setActiveParticipation(source ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveParticipation(null);

    const dragData = event.active.data.current as DragData | undefined;
    const dropData = event.over?.data.current as DropData | undefined;

    const assignment = resolveDropAssignment(dragData, dropData);
    if (!assignment) return;

    onAssignTeam?.(assignment.participationId, assignment.teamId);
  };

  const handleDragCancel = () => {
    setActiveParticipation(null);
  };

  // dnd-kit id(예: `participation-p-1`)를 사람이 읽을 수 있는 이름으로 변환한다.
  // 내부 ID가 그대로 스크린리더에 노출되지 않도록 한다. fe-plan §10.
  const announcements = buildKanbanAnnouncements({
    resolveParticipationName: (id) => {
      const participationId = stripPrefix(id, 'participation-');
      const found =
        grouped.unassigned.find((p) => p.id === participationId) ??
        findInTeams(grouped.byTeamId, participationId);
      return found?.name ?? '참가자';
    },
    resolveDropAreaName: (id) => {
      if (id === 'unassigned') return '미배치 영역';
      const teamId = stripPrefix(id, 'team-');
      const team = teams.find((t) => t.id === teamId);
      return team ? `${team.teamName} 팀` : '팀';
    },
  });

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
        {sidebar}
        {columns}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeParticipation ? (
          <DragOverlayCard participation={activeParticipation} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

/**
 * dnd-kit 스크린리더 한국어 안내. fe-plan v1.2 §10.
 * 기본값은 영문이라 한국어 UI와 튀므로 동일한 의미의 한글 문구로 대체한다.
 * 참고: https://docs.dndkit.com/api-documentation/context-provider/accessibility
 */
const KANBAN_SCREEN_READER_INSTRUCTIONS: ScreenReaderInstructions = {
  draggable:
    '드래그 가능한 항목에 포커스한 뒤 스페이스 또는 엔터를 눌러 잡으세요. 방향키로 이동하고, 다시 스페이스나 엔터를 눌러 놓을 수 있습니다. 취소하려면 Esc를 누르세요.',
};

interface KanbanAnnouncementLookup {
  /** dnd-kit draggable id(`participation-p-1`)를 참가자 이름으로 변환한다. */
  resolveParticipationName: (id: string) => string;
  /** dnd-kit droppable id(`team-t-1` 또는 `unassigned`)를 드롭 영역 이름으로 변환한다. */
  resolveDropAreaName: (id: string) => string;
}

/**
 * 한국어 스크린리더 안내 팩토리. dnd-kit 내부 ID가 아닌
 * 참가자 이름/팀 이름을 읽어주도록 lookup을 주입받는다.
 */
function buildKanbanAnnouncements({
  resolveParticipationName,
  resolveDropAreaName,
}: KanbanAnnouncementLookup): Announcements {
  return {
    onDragStart({ active }) {
      return `${resolveParticipationName(String(active.id))} 항목을 잡았습니다.`;
    },
    onDragOver({ active, over }) {
      const name = resolveParticipationName(String(active.id));
      if (over) {
        return `${name} 항목이 ${resolveDropAreaName(String(over.id))} 위에 있습니다.`;
      }
      return `${name} 항목이 드롭 영역 밖으로 이동했습니다.`;
    },
    onDragEnd({ active, over }) {
      const name = resolveParticipationName(String(active.id));
      if (over) {
        return `${name} 항목을 ${resolveDropAreaName(String(over.id))} 위에 놓았습니다.`;
      }
      return `${name} 항목을 놓았습니다.`;
    },
    onDragCancel({ active }) {
      return `${resolveParticipationName(String(active.id))} 항목 드래그가 취소되었습니다.`;
    },
  };
}

function stripPrefix(value: string, prefix: string): string {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

function findInTeams(
  byTeamId: Map<string, Participation[]>,
  participationId: string,
): Participation | undefined {
  for (const members of byTeamId.values()) {
    const found = members.find((m) => m.id === participationId);
    if (found) return found;
  }
  return undefined;
}

/**
 * `DragOverlay` 내부에 렌더되는 임시 카드. ui-spec §4-4 유지.
 * 드래그 중 실제 카드는 opacity-30, overlay는 tilt로 구분.
 */
function DragOverlayCard({ participation }: { participation: Participation }) {
  return (
    <div
      data-testid="drag-overlay-card"
      className="flex items-start gap-2 bg-white border border-gray-300 rounded-lg px-2.5 py-2 shadow-lg rotate-2 w-[200px]"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {participation.name}
        </p>
      </div>
    </div>
  );
}
