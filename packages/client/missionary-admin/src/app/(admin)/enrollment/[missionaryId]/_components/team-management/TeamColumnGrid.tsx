'use client';

import { TeamColumn } from './TeamColumn';

import type { Participation } from 'apis/participation';
import type { Team } from 'apis/team';

interface TeamColumnGridProps {
  teams: Team[];
  byTeamId: Map<string, Participation[]>;
}

/**
 * 팀 컬럼 그리드. ui-spec §3-4, §8.
 *
 * flex-wrap으로 2~20팀까지 한 화면에서 세로 스크롤 처리한다.
 * `NewTeamGhostColumn`은 W2-4에서 마지막 칼럼으로 추가한다.
 *
 * W5에서 상위 `TeamManagementSection`이 `filterTeams`로 필터링한 `teams`를
 * 내려주면 그대로 렌더된다.
 */
export function TeamColumnGrid({ teams, byTeamId }: TeamColumnGridProps) {
  return (
    <div
      data-testid="team-column-grid"
      className="flex flex-1 flex-wrap gap-3 content-start overflow-y-auto"
    >
      {teams.map((team) => (
        <TeamColumn
          key={team.id}
          team={team}
          members={byTeamId.get(team.id) ?? []}
        />
      ))}
    </div>
  );
}
