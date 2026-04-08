'use client';

import { overlay } from '@samilhero/design-system';
import { useDebounce } from 'hooks/useDebounce';
import { Users } from 'lucide-react';
import { useState } from 'react';

import { groupParticipationsByTeam } from './_utils/groupParticipationsByTeam';
import { filterTeams } from './filterTeams';
import { KanbanBoard } from './KanbanBoard';
import { TeamColumnGrid } from './TeamColumnGrid';
import { TeamCreateModal } from './TeamCreateModal';
import { TeamDeleteModal } from './TeamDeleteModal';
import { TeamEditModal } from './TeamEditModal';
import { TeamFilterBar } from './TeamFilterBar';
import { TeamFilterEmptyState } from './TeamFilterEmptyState';
import { TeamManagementToolbar } from './TeamManagementToolbar';
import { UnassignedSidebar } from './UnassignedSidebar';
import { useAssignParticipationToTeam } from '../../_hooks/useAssignParticipationToTeam';
import { useGetMissionGroupRegions } from '../../_hooks/useGetMissionGroupRegions';
import { useGetParticipations } from '../../_hooks/useGetParticipations';
import { useGetTeams } from '../../_hooks/useGetTeams';

import type { TeamFilterState } from './types';
import type { Participation } from 'apis/participation';
import type { Team } from 'apis/team';

interface TeamManagementSectionProps {
  missionaryId: string;
  missionGroupId: string | null;
}

/**
 * 팀 관리 탭의 루트 컨테이너. fe-plan v1.2 §3-2, §4-7.
 *
 * 책임:
 * - `useGetTeams({ missionaryId })`로 팀 메타 조회 (participations 비임베드, R-2 옵션 B)
 * - `useGetParticipations({ missionaryId, limit 생략 })`로 참가자 전체 조회 (R-3)
 * - `useGetMissionGroupRegions({ missionGroupId })`로 모달 연계지 옵션 조회
 * - `groupParticipationsByTeam`으로 미배치/팀별 그룹 derive
 * - 팀 생성/수정/삭제 모달 호출 (`overlay.openAsync<boolean>`)
 * - 로딩/에러/빈 상태 분기 + 자식에 데이터 전달
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
  const {
    data: teams,
    isLoading: isTeamsLoading,
    isError: isTeamsError,
    refetch: refetchTeams,
  } = useGetTeams({ missionaryId });

  const {
    data: participations,
    isLoading: isParticipationsLoading,
    isError: isParticipationsError,
    refetch: refetchParticipations,
  } = useGetParticipations({
    params: { missionaryId },
  });

  const handleRetryFetch = () => {
    refetchTeams();
    refetchParticipations();
  };

  // 모달 연계지 옵션 — missionGroupId가 null이면 no-op.
  const { data: regionsData } = useGetMissionGroupRegions({ missionGroupId });
  const regions = regionsData?.data ?? [];

  // 팀 검색/필터 — 로컬 상태 + 팀명은 200ms 디바운스. fe-plan §4-1, §6-3.
  const [filter, setFilter] = useState<TeamFilterState>({
    query: '',
    regionId: '',
  });
  const debouncedQuery = useDebounce(filter.query, 200);

  const assignTeam = useAssignParticipationToTeam();
  const handleAssignTeam = (participationId: string, teamId: string | null) => {
    assignTeam.mutate({ participationId, teamId });
  };

  const participationList: Participation[] = participations?.data ?? [];

  const handleCreateTeam = () => {
    overlay.openAsync<boolean>(({ isOpen, close, unmount }) => (
      <TeamCreateModal
        isOpen={isOpen}
        close={(result) => {
          close(result);
          setTimeout(unmount, 300);
        }}
        missionaryId={missionaryId}
        participations={participationList}
        regions={regions}
      />
    ));
  };

  const handleEditTeam = (team: Team) => {
    overlay.openAsync<boolean>(({ isOpen, close, unmount }) => (
      <TeamEditModal
        isOpen={isOpen}
        close={(result) => {
          close(result);
          setTimeout(unmount, 300);
        }}
        team={team}
        participations={participationList}
        regions={regions}
      />
    ));
  };

  const handleDeleteTeam = (team: Team, memberCount: number) => {
    overlay.openAsync<boolean>(({ isOpen, close, unmount }) => (
      <TeamDeleteModal
        isOpen={isOpen}
        close={(result) => {
          close(result);
          setTimeout(unmount, 300);
        }}
        team={team}
        memberCount={memberCount}
      />
    ));
  };

  const isLoading = isTeamsLoading || isParticipationsLoading;
  const isError = isTeamsError || isParticipationsError;

  if (isLoading) {
    return <TeamsLoadingSkeleton />;
  }

  if (isError || !teams || !participations) {
    return <TeamsErrorState onRetry={handleRetryFetch} />;
  }

  const grouped = groupParticipationsByTeam(participations.data);
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
        onCreateTeam={handleCreateTeam}
      />

      <TeamFilterBar
        filter={filter}
        onFilterChange={setFilter}
        regions={regions}
        filteredCount={filteredTeams.length}
        totalCount={teams.length}
      />

      {teams.length === 0 ? (
        <TeamsEmptyState onCreateTeam={handleCreateTeam} />
      ) : (
        <KanbanBoard
          teams={filteredTeams}
          grouped={grouped}
          onAssignTeam={handleAssignTeam}
        >
          <UnassignedSidebar unassigned={grouped.unassigned} />
          {filteredTeams.length === 0 ? (
            <TeamFilterEmptyState
              onResetFilter={() => setFilter({ query: '', regionId: '' })}
            />
          ) : (
            <TeamColumnGrid
              teams={filteredTeams}
              byTeamId={grouped.byTeamId}
              onCreateTeam={handleCreateTeam}
              onEditTeam={handleEditTeam}
              onDeleteTeam={handleDeleteTeam}
            />
          )}
        </KanbanBoard>
      )}
    </div>
  );
}

/**
 * 팀 목록/참가자 조회 로딩 스켈레톤. ui-spec §6-4.
 * 미배치 사이드바 placeholder + 팀 컬럼 3개.
 */
function TeamsLoadingSkeleton() {
  return (
    <div
      data-testid="team-management-loading"
      className="flex flex-row flex-1 gap-4 p-4 min-h-[560px]"
    >
      <div
        aria-hidden
        className="w-[260px] shrink-0 animate-pulse bg-gray-100 rounded-xl"
      />
      <div className="flex flex-1 flex-wrap gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            aria-hidden
            className="w-[220px] h-[300px] animate-pulse bg-gray-100 rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}

/**
 * 팀 0개 Empty State. ui-spec §6-1.
 */
function TeamsEmptyState({ onCreateTeam }: { onCreateTeam?: () => void }) {
  return (
    <div
      data-testid="teams-empty-state"
      className="flex flex-1 flex-col items-center justify-center gap-2 min-h-[400px] text-center"
    >
      <Users size={36} className="text-gray-300" aria-hidden />
      <p className="text-sm font-semibold text-gray-700">팀이 아직 없습니다</p>
      <p className="text-xs text-gray-400">
        상단 &ldquo;팀 추가&rdquo; 버튼으로 첫 팀을 만들어보세요
      </p>
      {onCreateTeam && (
        <button
          type="button"
          onClick={onCreateTeam}
          data-testid="teams-empty-create-button"
          className="mt-2 inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          팀 추가
        </button>
      )}
    </div>
  );
}

/**
 * 팀 또는 참가자 조회 실패 시 표시. 간단한 에러 알림.
 * 상세 에러 경계는 상위 `error.tsx`가 담당.
 */
function TeamsErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      data-testid="team-management-error"
      role="alert"
      className="flex flex-1 flex-col items-center justify-center gap-3 min-h-[400px] text-sm text-gray-500"
    >
      <p>팀 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          data-testid="team-management-error-retry"
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
