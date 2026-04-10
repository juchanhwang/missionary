'use client';

import { groupParticipationsByTeam } from './_utils/groupParticipationsByTeam';
import { filterTeams } from './filterTeams';
import { KanbanBoard } from './KanbanBoard';
import { TeamColumnGrid } from './TeamColumnGrid';
import { TeamFilterBar } from './TeamFilterBar';
import { TeamFilterEmptyState } from './TeamFilterEmptyState';
import { TeamManagementHeader } from './TeamManagementHeader';
import { TeamManagementToolbar } from './TeamManagementToolbar';
import { TeamsEmptyState } from './TeamsEmptyState';
import { TeamsErrorState } from './TeamsErrorState';
import { TeamsLoadingSkeleton } from './TeamsLoadingSkeleton';
import { UnassignedSidebar } from './UnassignedSidebar';
import { useTeamFilter } from './useTeamFilter';
import { useTeamManagementData } from './useTeamManagementData';
import { useTeamModalActions } from './useTeamModalActions';
import { useAssignParticipationToTeam } from '../_hooks/useAssignParticipationToTeam';

import type { EnrollmentMissionSummary } from 'apis/enrollment';
import type { RegionListResponse } from 'apis/missionaryRegion';
import type { PaginatedParticipationsResponse } from 'apis/participation';
import type { Team } from 'apis/team';

interface TeamManagementPageProps {
  mission: EnrollmentMissionSummary;
  initialTeams: Team[];
  initialParticipations: PaginatedParticipationsResponse;
  initialRegions: RegionListResponse;
}

/**
 * 팀 관리 페이지의 루트 orchestrator.
 *
 * 책임:
 * - 도메인 훅(`useTeamManagementData`/`useTeamFilter`/`useTeamModalActions`)을 조합
 * - 로딩/에러/빈 상태 분기
 * - 파생 값(grouped, filteredTeams) derive
 * - 자식 컴포넌트에 데이터/핸들러 전달
 *
 * RSC(`teams/page.tsx`)가 prefetch한 데이터를 `initial*` props로 받아
 * 초기 렌더 즉시 칸반 보드를 보여준다.
 */
export function TeamManagementPage({
  mission,
  initialTeams,
  initialParticipations,
  initialRegions,
}: TeamManagementPageProps) {
  const { teams, participations, regions, isLoading, isError, handleRetry } =
    useTeamManagementData({
      missionaryId: mission.id,
      missionGroupId: mission.missionGroupId,
      initialTeams,
      initialParticipations,
      initialRegions,
    });

  const { filter, setFilter, debouncedQuery, resetFilter } = useTeamFilter();

  const { openCreateModal, openEditModal, openDeleteModal } =
    useTeamModalActions({
      missionaryId: mission.id,
      participations: participations ?? [],
      regions,
    });

  const assignTeam = useAssignParticipationToTeam();
  const handleAssignTeam = (participationId: string, teamId: string | null) => {
    assignTeam.mutate({ participationId, teamId });
  };

  if (isLoading) {
    return <TeamsLoadingSkeleton />;
  }

  if (isError || !teams || !participations) {
    return <TeamsErrorState onRetry={handleRetry} />;
  }

  const grouped = groupParticipationsByTeam(participations);
  const filteredTeams = filterTeams(teams, {
    query: debouncedQuery,
    regionId: filter.regionId,
  });

  return (
    <div className="flex flex-col flex-1 p-8 gap-5 min-h-0">
      <TeamManagementHeader mission={mission} />

      <div
        data-testid="team-management-section"
        className="flex flex-col flex-1 min-h-0 gap-4"
      >
        <TeamManagementToolbar
          teamCount={teams.length}
          unassignedCount={grouped.unassigned.length}
          onCreateTeam={openCreateModal}
        />

        <TeamFilterBar
          filter={filter}
          onFilterChange={setFilter}
          regions={regions}
          filteredCount={filteredTeams.length}
          totalCount={teams.length}
        />

        {teams.length === 0 ? (
          <TeamsEmptyState onCreateTeam={openCreateModal} />
        ) : (
          <KanbanBoard
            teams={filteredTeams}
            grouped={grouped}
            onAssignTeam={handleAssignTeam}
          >
            <UnassignedSidebar unassigned={grouped.unassigned} />
            {filteredTeams.length === 0 ? (
              <TeamFilterEmptyState onResetFilter={resetFilter} />
            ) : (
              <TeamColumnGrid
                teams={filteredTeams}
                grouped={grouped}
                onCreateTeam={openCreateModal}
                onEditTeam={openEditModal}
                onDeleteTeam={openDeleteModal}
              />
            )}
          </KanbanBoard>
        )}
      </div>
    </div>
  );
}
