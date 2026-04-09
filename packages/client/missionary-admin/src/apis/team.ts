import api from './instance';
import { stripEmpty } from './utils';

// === 타입 정의 ===

/**
 * `Team` 응답에 포함되는 연계지(`MissionaryRegion`)의 최소 형태.
 *
 * BE는 `TEAM_INCLUDE`를 통해 `MissionaryRegion` 전체 scalar를 반환하지만,
 * FE는 칸반 컬럼 헤더에서 `name`만 사용하므로 사용 필드만 명시한다.
 * (TypeScript 구조적 타이핑상 BE 응답이 superset이라 호환됨)
 */
export interface TeamMissionaryRegion {
  id: string;
  name: string;
}

/**
 * 팀 단건 응답.
 *
 * BE 결정(team-lead 메시지 + `prisma-team.repository.ts`의 `TEAM_INCLUDE`):
 * - `participations`는 임베드하지 **않는다** (R-2 옵션 B).
 * - 멤버 데이터는 `useGetParticipations` 캐시에서 `groupParticipationsByTeam`으로 derive.
 *
 * BE 응답에는 `missionary` / `church` / `teamMembers` 객체가 함께 들어오지만
 * FE는 사용하지 않으므로 타입에 포함하지 않는다 (가독성/결합도 ↓).
 */
export interface Team {
  id: string;
  teamName: string;
  leaderUserId: string;
  leaderUserName: string;
  missionaryId: string;
  churchId: string | null;
  missionaryRegionId: string | null;
  missionaryRegion: TeamMissionaryRegion | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 팀 생성 요청 본문.
 * BE `CreateTeamDto` (`packages/server/missionary-server/src/team/dto/create-team.dto.ts`)와 일치.
 */
export interface CreateTeamPayload {
  missionaryId: string;
  teamName: string;
  leaderUserId: string;
  leaderUserName: string;
  churchId?: string;
  missionaryRegionId?: string;
}

/**
 * 팀 수정 요청 본문.
 * BE `UpdateTeamDto`는 `CreateTeamDto`의 `PartialType`. 모든 필드 optional.
 */
export interface UpdateTeamPayload {
  teamName?: string;
  leaderUserId?: string;
  leaderUserName?: string;
  churchId?: string;
  missionaryRegionId?: string;
}

// === API ===

export const teamApi = {
  getTeams(missionaryId: string) {
    return api.get<Team[]>('/teams', {
      params: stripEmpty({ missionaryId }),
    });
  },

  createTeam(data: CreateTeamPayload) {
    return api.post<Team>('/teams', data);
  },

  updateTeam(id: string, data: UpdateTeamPayload) {
    return api.patch<Team>(`/teams/${id}`, data);
  },

  deleteTeam(id: string) {
    return api.delete<void>(`/teams/${id}`);
  },
};
