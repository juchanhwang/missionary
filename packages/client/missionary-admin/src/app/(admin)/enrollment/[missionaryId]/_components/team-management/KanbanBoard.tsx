'use client';

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useState } from 'react';

import { resolveDropAssignment } from './_utils/resolveDropAssignment';
import { TeamColumnGrid } from './TeamColumnGrid';
import { UnassignedSidebar } from './UnassignedSidebar';

import type { DragData, DropData, GroupedParticipations } from './types';
import type { Participation } from 'apis/participation';
import type { Team } from 'apis/team';

interface KanbanBoardProps {
  teams: Team[];
  grouped: GroupedParticipations;
  onCreateTeam?: () => void;
  onEditTeam?: (team: Team) => void;
  onDeleteTeam?: (team: Team, memberCount: number) => void;
  onAssignTeam?: (participationId: string, teamId: string | null) => void;
  /** 필터 결과가 비어 있는지. fe-plan §6-3: 빈 결과 안내 표시용. */
  filterEmpty?: boolean;
  /** 필터 초기화 콜백. `filterEmpty`일 때 안내 영역에 버튼으로 노출. */
  onResetFilter?: () => void;
}

/**
 * 칸반 보드 루트. fe-plan v1.2 §3-1, §3-3, ui-spec §3-2.
 *
 * - 좌측: `UnassignedSidebar` (w-[260px] sticky)
 * - 우측: `TeamColumnGrid` (flex-1 flex-wrap) + Ghost 컬럼
 * - DndContext로 카드 드래그 → 팀/미배치 드롭 영역으로 이동
 * - `DragOverlay`로 드래그 중인 카드를 포인터에 고정 렌더
 * - `onAssignTeam`을 통해 상위에서 mutation을 수행 (optimistic)
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
  onCreateTeam,
  onEditTeam,
  onDeleteTeam,
  onAssignTeam,
  filterEmpty = false,
  onResetFilter,
}: KanbanBoardProps) {
  const [activeParticipation, setActiveParticipation] =
    useState<Participation | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor),
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        data-testid="kanban-board"
        className="flex flex-row flex-1 gap-4 min-h-[560px]"
      >
        <UnassignedSidebar unassigned={grouped.unassigned} />
        {filterEmpty ? (
          <TeamFilterEmptyState onResetFilter={onResetFilter} />
        ) : (
          <TeamColumnGrid
            teams={teams}
            byTeamId={grouped.byTeamId}
            onCreateTeam={onCreateTeam}
            onEditTeam={onEditTeam}
            onDeleteTeam={onDeleteTeam}
          />
        )}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeParticipation ? (
          <DragOverlayCard participation={activeParticipation} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
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
 * 검색/필터 결과가 없을 때 팀 컬럼 영역에 렌더되는 안내. fe-plan §6-3.
 * 미배치 사이드바는 그대로 유지되므로 KanbanBoard 내부에서 처리한다.
 */
function TeamFilterEmptyState({
  onResetFilter,
}: {
  onResetFilter?: () => void;
}) {
  return (
    <div
      data-testid="team-filter-empty-state"
      className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-gray-500"
    >
      <p>조건에 맞는 팀이 없습니다.</p>
      {onResetFilter && (
        <button
          type="button"
          onClick={onResetFilter}
          data-testid="team-filter-empty-reset"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          필터 초기화
        </button>
      )}
    </div>
  );
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
