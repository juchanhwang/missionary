import { render, screen } from 'test/test-utils';

import { groupParticipationsByTeam } from './_utils/groupParticipationsByTeam';
import { KanbanBoard } from './KanbanBoard';

import type { Participation } from 'apis/participation';
import type { Team } from 'apis/team';

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

    render(<KanbanBoard teams={teams} grouped={grouped} />);

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

    render(<KanbanBoard teams={teams} grouped={grouped} />);

    expect(screen.getByText('1팀')).toBeInTheDocument();
    expect(screen.getByTestId('team-member-count-team-1')).toHaveTextContent(
      '2명',
    );
    expect(screen.getByText('홍길동 · 서울 A연계지')).toBeInTheDocument();
  });

  it('팀에 멤버가 없으면 드롭 힌트를 보여준다', () => {
    const teams = [createTeam({ id: 'team-empty', teamName: '빈팀' })];
    const grouped = groupParticipationsByTeam([]);

    render(<KanbanBoard teams={teams} grouped={grouped} />);

    expect(screen.getByTestId('empty-members-drop-hint')).toBeInTheDocument();
  });

  it('미배치 참가자가 없으면 "모두 배치 완료" empty state를 표시한다', () => {
    const teams = [createTeam({ id: 'team-1' })];
    const participations = [
      createParticipation({ id: 'p-1', teamId: 'team-1' }),
    ];
    const grouped = groupParticipationsByTeam(participations);

    render(<KanbanBoard teams={teams} grouped={grouped} />);

    expect(screen.getByTestId('unassigned-empty-state')).toBeInTheDocument();
    expect(screen.getByText('모두 배치 완료!')).toBeInTheDocument();
  });

  it('미배치 참가자가 있으면 이름을 사이드바 카드 리스트로 렌더한다', () => {
    const teams = [createTeam({ id: 'team-1' })];
    const participations = [
      createParticipation({ id: 'p-1', teamId: null, name: '박민수' }),
      createParticipation({ id: 'p-2', teamId: null, name: '최지원' }),
    ];
    const grouped = groupParticipationsByTeam(participations);

    render(<KanbanBoard teams={teams} grouped={grouped} />);

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
