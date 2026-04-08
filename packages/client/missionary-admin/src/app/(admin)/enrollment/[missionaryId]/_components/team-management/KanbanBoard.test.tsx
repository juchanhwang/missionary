import { render, screen } from 'test/test-utils';

import { groupParticipationsByTeam } from './_utils/groupParticipationsByTeam';
import { KanbanBoard } from './KanbanBoard';
import { TeamColumnGrid } from './TeamColumnGrid';
import { UnassignedSidebar } from './UnassignedSidebar';

import type { GroupedParticipations } from './types';
import type { Participation } from 'apis/participation';
import type { Team } from 'apis/team';

/**
 * KanbanBoard는 DnD 전담 shell이라 children으로 보드 내부 트리를 주입받는다.
 * 테스트에서는 실제 `UnassignedSidebar`/`TeamColumnGrid`를 합성해
 * 통합 레이아웃을 검증한다.
 */
function renderKanbanBoard(teams: Team[], grouped: GroupedParticipations) {
  return render(
    <KanbanBoard teams={teams} grouped={grouped}>
      <UnassignedSidebar unassigned={grouped.unassigned} />
      <TeamColumnGrid teams={teams} grouped={grouped} />
    </KanbanBoard>,
  );
}

function createTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: 'team-1',
    teamName: '1팀',
    leaderUserId: 'user-1',
    leaderUserName: '홍길동',
    missionaryId: 'missionary-1',
    churchId: null,
    missionaryRegionId: null,
    missionaryRegion: null,
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-01T00:00:00.000Z',
    ...overrides,
  };
}

function createParticipation(
  overrides: Partial<Participation> = {},
): Participation {
  return {
    id: 'p-1',
    name: '참가자1',
    birthDate: '2000-01-01',
    applyFee: null,
    isPaid: false,
    identificationNumber: null,
    isOwnCar: false,
    missionaryId: 'missionary-1',
    userId: 'user-1',
    teamId: null,
    team: null,
    createdAt: '2026-04-01T00:00:00.000Z',
    affiliation: '서울',
    attendanceOptionId: 'att-1',
    attendanceOption: null,
    cohort: 12,
    hasPastParticipation: null,
    isCollegeStudent: null,
    formAnswers: [],
    ...overrides,
  };
}

describe('KanbanBoard', () => {
  it('팀 컬럼과 미배치 사이드바를 함께 렌더한다', () => {
    const teams = [
      createTeam({ id: 'team-1', teamName: '1팀' }),
      createTeam({ id: 'team-2', teamName: '2팀' }),
    ];
    const participations = [
      createParticipation({ id: 'p-1', teamId: 'team-1', name: '김철수' }),
      createParticipation({ id: 'p-2', teamId: 'team-2', name: '이영희' }),
      createParticipation({ id: 'p-3', teamId: null, name: '박민수' }),
    ];
    const grouped = groupParticipationsByTeam(participations);

    renderKanbanBoard(teams, grouped);

    expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
    expect(screen.getByTestId('unassigned-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('team-column-grid')).toBeInTheDocument();
    expect(screen.getByTestId('team-column-team-1')).toBeInTheDocument();
    expect(screen.getByTestId('team-column-team-2')).toBeInTheDocument();
  });

  it('각 팀 컬럼 헤더에 팀명과 인원 수를 표시한다', () => {
    const teams = [
      createTeam({
        id: 'team-1',
        teamName: '1팀',
        leaderUserName: '홍길동',
        missionaryRegion: { id: 'r-1', name: '서울 A연계지' },
      }),
    ];
    const participations = [
      createParticipation({ id: 'p-1', teamId: 'team-1' }),
      createParticipation({ id: 'p-2', teamId: 'team-1' }),
    ];
    const grouped = groupParticipationsByTeam(participations);

    renderKanbanBoard(teams, grouped);

    expect(screen.getByText('1팀')).toBeInTheDocument();
    expect(screen.getByTestId('team-member-count-team-1')).toHaveTextContent(
      '2명',
    );
    expect(screen.getByText('홍길동 · 서울 A연계지')).toBeInTheDocument();
  });

  it('팀에 멤버가 없으면 드롭 힌트를 보여준다', () => {
    const teams = [createTeam({ id: 'team-empty', teamName: '빈팀' })];
    const grouped = groupParticipationsByTeam([]);

    renderKanbanBoard(teams, grouped);

    expect(screen.getByTestId('empty-members-drop-hint')).toBeInTheDocument();
  });

  it('미배치 참가자가 없으면 "모두 배치 완료" empty state를 표시한다', () => {
    const teams = [createTeam({ id: 'team-1' })];
    const participations = [
      createParticipation({ id: 'p-1', teamId: 'team-1' }),
    ];
    const grouped = groupParticipationsByTeam(participations);

    renderKanbanBoard(teams, grouped);

    expect(screen.getByTestId('unassigned-empty-state')).toBeInTheDocument();
    expect(screen.getByText('모두 배치 완료!')).toBeInTheDocument();
  });

  it('flex chain min-h-0을 무력화하지 않도록 명시적 min-height를 갖지 않는다', () => {
    // 회귀 가드: 이전에 `min-h-[560px]`가 부모(`flex-1 min-h-0`) chain을 무력화해
    // 자식 `TeamColumnGrid`의 `overflow-y-auto`가 동작하지 않았고, leak이
    // admin shell의 `overflow-hidden`에서 잘려 사용자가 스크롤할 수 없었다.
    // KanbanBoard는 부모 height을 그대로 받아야 하므로 명시적 min-h를 가지면 안 된다.
    const teams = [createTeam({ id: 'team-1' })];
    const grouped = groupParticipationsByTeam([]);

    renderKanbanBoard(teams, grouped);

    const board = screen.getByTestId('kanban-board');
    expect(board).toHaveClass('min-h-0');
    expect(board.className).not.toMatch(/\bmin-h-\[/);
  });

  it('미배치 참가자가 있으면 이름을 사이드바 카드 리스트로 렌더한다', () => {
    const teams = [createTeam({ id: 'team-1' })];
    const participations = [
      createParticipation({ id: 'p-1', teamId: null, name: '박민수' }),
      createParticipation({ id: 'p-2', teamId: null, name: '최지원' }),
    ];
    const grouped = groupParticipationsByTeam(participations);

    renderKanbanBoard(teams, grouped);

    expect(screen.getByTestId('unassigned-sidebar-count')).toHaveTextContent(
      '2',
    );
    expect(screen.getByTestId('unassigned-card-p-1')).toHaveTextContent(
      '박민수',
    );
    expect(screen.getByTestId('unassigned-card-p-2')).toHaveTextContent(
      '최지원',
    );
  });
});
