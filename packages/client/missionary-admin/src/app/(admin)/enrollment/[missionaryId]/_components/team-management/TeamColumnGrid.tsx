'use client';

import { useActiveParticipation } from './_utils/useActiveParticipation';
import { NewTeamGhostColumn } from './NewTeamGhostColumn';
import { TeamColumn } from './TeamColumn';

import type { GroupedParticipations } from './types';
import type { Team } from 'apis/team';

interface TeamColumnGridProps {
  teams: Team[];
  grouped: GroupedParticipations;
  onCreateTeam?: () => void;
  onEditTeam?: (team: Team) => void;
  onDeleteTeam?: (team: Team, memberCount: number) => void;
}

/**
 * 팀 컬럼 그리드. ui-spec §3-4, §8.
 *
 * flex-wrap으로 2~20팀까지 한 화면에서 세로 스크롤 처리한다.
 * 마지막에 `NewTeamGhostColumn`을 두어 팀 생성 CTA를 가까이 제공한다.
 *
 * W5에서 상위 `TeamManagementSection`이 `filterTeams`로 필터링한 `teams`를
 * 내려주면 그대로 렌더된다.
 *
 * 활성 드래그 객체는 여기서 한 번 lookup해 각 `TeamColumn`에 prop으로 내려준다.
 * 컬럼별로 호출하면 N팀 × lookup 비용이 들고, ghost 카드가 동일한 참가자 정보를
 * 반복 계산하게 된다.
 */
export function TeamColumnGrid({
  teams,
  grouped,
  onCreateTeam,
  onEditTeam,
  onDeleteTeam,
}: TeamColumnGridProps) {
  const activeParticipation = useActiveParticipation(grouped);

  return (
    <div
      data-testid="team-column-grid"
      className="flex flex-1 flex-wrap gap-3 content-start overflow-y-auto"
    >
      {teams.map((team) => (
        <TeamColumn
          key={team.id}
          team={team}
          members={grouped.byTeamId.get(team.id) ?? []}
          activeParticipation={activeParticipation}
          onEdit={onEditTeam}
          onDelete={onDeleteTeam}
        />
      ))}
      <NewTeamGhostColumn onClick={onCreateTeam} />
    </div>
  );
}
