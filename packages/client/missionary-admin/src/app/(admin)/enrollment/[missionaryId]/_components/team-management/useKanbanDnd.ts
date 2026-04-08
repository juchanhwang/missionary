'use client';

import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';

import { findParticipationInTeams } from './_utils/findParticipationInTeams';
import { resolveDropAssignment } from './_utils/resolveDropAssignment';

import type { DragData, DropData, GroupedParticipations } from './types';
import type { Participation } from 'apis/participation';

interface UseKanbanDndParams {
  grouped: GroupedParticipations;
  onAssignTeam?: (participationId: string, teamId: string | null) => void;
}

interface UseKanbanDndReturn {
  sensors: ReturnType<typeof useSensors>;
  activeParticipation: Participation | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragCancel: () => void;
}

/**
 * 칸반 보드 DnD state machine.
 *
 * 책임:
 * - sensors 구성 (PointerSensor 8px activation + KeyboardSensor a11y)
 * - 드래그 중인 `activeParticipation` 상태 추적
 * - 드래그 라이프사이클 핸들러에서 mutation 위임
 *
 * 센서:
 * - PointerSensor (activationConstraint: 8px 이동) — 클릭과 드래그 구분
 * - KeyboardSensor — Space로 pick up, 방향키로 이동, Enter로 drop, Esc로 cancel (a11y)
 *
 * 드롭 룰 (`resolveDropAssignment`에 위임):
 * - over가 null이거나 출발지와 같으면 noop
 * - `over.id === 'unassigned'` → teamId = null
 * - `over.id === 'team-{id}'` → teamId = {id}
 */
export function useKanbanDnd({
  grouped,
  onAssignTeam,
}: UseKanbanDndParams): UseKanbanDndReturn {
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
      findParticipationInTeams(grouped.byTeamId, data.participationId);
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

  return {
    sensors,
    activeParticipation,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
