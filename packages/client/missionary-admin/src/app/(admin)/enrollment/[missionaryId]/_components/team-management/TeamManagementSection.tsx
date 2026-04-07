'use client';

import { Users } from 'lucide-react';

import { groupParticipationsByTeam } from './_utils/groupParticipationsByTeam';
import { KanbanBoard } from './KanbanBoard';
import { TeamManagementToolbar } from './TeamManagementToolbar';
import { useGetParticipations } from '../../_hooks/useGetParticipations';
import { useGetTeams } from '../../_hooks/useGetTeams';

interface TeamManagementSectionProps {
  missionaryId: string;
}

/**
 * 팀 관리 탭의 루트 컨테이너. fe-plan v1.2 §3-2, §4-7.
 *
 * 책임:
 * - `useGetTeams({ missionaryId })`로 팀 메타 조회 (participations 비임베드, R-2 옵션 B)
 * - `useGetParticipations({ missionaryId, limit 생략 })`로 참가자 전체 조회 (R-3)
 * - `groupParticipationsByTeam`으로 미배치/팀별 그룹 derive
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
}: TeamManagementSectionProps) {
  const {
    data: teams,
    isLoading: isTeamsLoading,
    isError: isTeamsError,
  } = useGetTeams({ missionaryId });

  const {
    data: participations,
    isLoading: isParticipationsLoading,
    isError: isParticipationsError,
  } = useGetParticipations({
    params: { missionaryId },
  });

  const isLoading = isTeamsLoading || isParticipationsLoading;
  const isError = isTeamsError || isParticipationsError;

  if (isLoading) {
    return <TeamsLoadingSkeleton />;
  }

  if (isError || !teams || !participations) {
    return <TeamsErrorState />;
  }

  const grouped = groupParticipationsByTeam(participations.data);

  return (
    <div
      data-testid="team-management-section"
      className="flex flex-col flex-1 min-h-0 gap-4 p-4"
    >
      <TeamManagementToolbar
        teamCount={teams.length}
        unassignedCount={grouped.unassigned.length}
      />

      {teams.length === 0 ? (
        <TeamsEmptyState />
      ) : (
        <KanbanBoard teams={teams} grouped={grouped} />
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
function TeamsEmptyState() {
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
    </div>
  );
}

/**
 * 팀 또는 참가자 조회 실패 시 표시. 간단한 에러 알림.
 * 상세 에러 경계는 상위 `error.tsx`가 담당.
 */
function TeamsErrorState() {
  return (
    <div
      data-testid="team-management-error"
      role="alert"
      className="flex flex-1 items-center justify-center min-h-[400px] text-sm text-gray-500"
    >
      팀 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
    </div>
  );
}
