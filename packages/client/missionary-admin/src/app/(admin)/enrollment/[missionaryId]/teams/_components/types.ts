import type { Participation } from 'apis/participation';

/**
 * 칸반 보드 드롭 타깃 ID 형태.
 * - `'unassigned'`: 좌측 미배치 사이드바
 * - `` `team-${teamId}` ``: 우측 팀 컬럼
 */
export type DropTargetId = `team-${string}` | 'unassigned';

/**
 * `useDraggable` data prop으로 전달되는 페이로드.
 * 드롭 시 `active.data.current`로 복원하여 mutation payload를 만들 때 사용.
 */
export interface DragData {
  participationId: string;
  fromTeamId: string | null; // null = 미배치 사이드바에서 출발
}

/**
 * `useDroppable` data prop으로 전달되는 페이로드.
 * 드롭 시 `over.data.current`로 복원하여 어느 컨테이너에 떨어졌는지 식별.
 */
export type DropData =
  | { type: 'unassigned' }
  | { type: 'team'; teamId: string };

/**
 * 검색/필터 상태. fe-plan v1.2 §4-6에 의거.
 * - `query`: 팀명 부분일치 (대소문자 무시), 디바운스는 컴포넌트 레벨에서 적용
 * - `regionId`: `missionaryRegionId` 정확 일치, 빈 문자열 = 전체
 */
export interface TeamFilterState {
  query: string;
  regionId: string;
}

/**
 * 클라이언트 그룹핑 결과 (R-2 옵션 B).
 * `byTeamId`는 멤버가 1명 이상인 팀만 키를 가진다 (멤버 0명인 팀은 빈 배열로 derive).
 */
export interface GroupedParticipations {
  byTeamId: Map<string, Participation[]>;
  unassigned: Participation[];
}
