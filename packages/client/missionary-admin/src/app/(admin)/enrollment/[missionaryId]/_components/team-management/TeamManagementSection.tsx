'use client';

import { groupParticipationsByTeam } from './_utils/groupParticipationsByTeam';
import { filterTeams } from './filterTeams';
import { KanbanBoard } from './KanbanBoard';
import { TeamColumnGrid } from './TeamColumnGrid';
import { TeamFilterBar } from './TeamFilterBar';
import { TeamFilterEmptyState } from './TeamFilterEmptyState';
import { TeamManagementToolbar } from './TeamManagementToolbar';
import { TeamsEmptyState } from './TeamsEmptyState';
import { TeamsErrorState } from './TeamsErrorState';
import { TeamsLoadingSkeleton } from './TeamsLoadingSkeleton';
import { UnassignedSidebar } from './UnassignedSidebar';
import { useTeamFilter } from './useTeamFilter';
import { useTeamManagementData } from './useTeamManagementData';
import { useTeamModalActions } from './useTeamModalActions';
import { useAssignParticipationToTeam } from '../../_hooks/useAssignParticipationToTeam';

interface TeamManagementSectionProps {
  missionaryId: string;
  missionGroupId: string | null;
}

/**
 * 팀 관리 탭의 루트 orchestrator. fe-plan v1.2 §3-2, §4-7.
 *
 * 책임:
 * - 도메인 훅(`useTeamManagementData`/`useTeamFilter`/`useTeamModalActions`)을 조합
 * - 로딩/에러/빈 상태 분기
 * - 파생 값(grouped, filteredTeams) derive
 * - 자식 컴포넌트에 데이터/핸들러 전달
 *
 * 도메인 로직(데이터 패칭, 필터 상태, 모달 호출 패턴)은 모두 훅으로 위임하여
 * 이 컴포넌트는 화면 조립만 담당한다.
 *
 * 참고 — 지연 패칭(lazy fetch) 스펙 편차:
 * fe-plan §4-7는 `enabled: activeTab === 'teams'`로 탭 진입 시에만 호출할 것을 권장한다.
 * 그러나 현재 `EnrollmentDetailTabs`는 `hidden` 토글로 두 탭을 항상 마운트하는 구조(R-10)이므로
 * `activeTab`을 lift-up 없이 이 컴포넌트가 알 방법이 없다.
 * 네트워크 비용보다 탭 전환 시 상태 유지(검색어·스크롤·드래그 중 상태)가 우선이라 판단해 편차를 수용한다.
 * W2 이후 성능 이슈가 확인되면 `EnrollmentDetailTabs`에서 `activeTab` prop을 내려주는 방식으로 교체한다.
 */
export function TeamManagementSection({
  missionaryId,
  missionGroupId,
}: TeamManagementSectionProps) {
  const { teams, participations, regions, isLoading, isError, handleRetry } =
    useTeamManagementData({ missionaryId, missionGroupId });

  const { filter, setFilter, debouncedQuery, resetFilter } = useTeamFilter();

  const { openCreateModal, openEditModal, openDeleteModal } =
    useTeamModalActions({
      missionaryId,
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
              byTeamId={grouped.byTeamId}
              onCreateTeam={openCreateModal}
              onEditTeam={openEditModal}
              onDeleteTeam={openDeleteModal}
            />
          )}
        </KanbanBoard>
      )}
    </div>
  );
}
