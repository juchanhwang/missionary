'use client';

import { TeamColumnGrid } from './TeamColumnGrid';
import { UnassignedSidebar } from './UnassignedSidebar';

import type { GroupedParticipations } from './types';
import type { Team } from 'apis/team';

interface KanbanBoardProps {
  teams: Team[];
  grouped: GroupedParticipations;
  onCreateTeam?: () => void;
  onEditTeam?: (team: Team) => void;
  onDeleteTeam?: (team: Team, memberCount: number) => void;
}

/**
 * 칸반 보드 루트. fe-plan v1.2 §3-1, ui-spec §3-2.
 *
 * - 좌측: `UnassignedSidebar` (w-[260px] sticky)
 * - 우측: `TeamColumnGrid` (flex-1 flex-wrap) + Ghost 컬럼
 *
 * W4에서 이 컴포넌트에 `DndContext` + `onDragStart/Over/End` 핸들러와
 * `DragOverlayCard`를 추가한다.
 */
export function KanbanBoard({
  teams,
  grouped,
  onCreateTeam,
  onEditTeam,
  onDeleteTeam,
}: KanbanBoardProps) {
  return (
    <div
      data-testid="kanban-board"
      className="flex flex-row flex-1 gap-4 min-h-[560px]"
    >
      <UnassignedSidebar unassigned={grouped.unassigned} />
      <TeamColumnGrid
        teams={teams}
        byTeamId={grouped.byTeamId}
        onCreateTeam={onCreateTeam}
        onEditTeam={onEditTeam}
        onDeleteTeam={onDeleteTeam}
      />
    </div>
  );
}
