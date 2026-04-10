import { render, screen } from 'test/test-utils';

import { TeamManagementPage } from './TeamManagementPage';

import type { EnrollmentMissionSummary } from 'apis/enrollment';
import type { Participation } from 'apis/participation';
import type { Team } from 'apis/team';

const MISSIONARY_ID = 'missionary-1';

const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => `/enrollment/${MISSIONARY_ID}/teams`,
  useSearchParams: () => new URLSearchParams(),
}));

function createMission(
  overrides: Partial<EnrollmentMissionSummary> = {},
): EnrollmentMissionSummary {
  return {
    id: MISSIONARY_ID,
    name: '테스트 선교',
    order: 1,
    category: 'DOMESTIC',
    status: 'IN_PROGRESS',
    enrollmentDeadline: null,
    missionStartDate: '2026-07-01',
    missionEndDate: '2026-07-15',
    maximumParticipantCount: null,
    currentParticipantCount: 3,
    paidCount: 1,
    managerName: null,
    missionGroupId: null,
    missionGroupName: null,
    isAcceptingResponses: true,
    closedMessage: null,
    ...overrides,
  };
}

function createTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: 'team-1',
    teamName: '1팀',
    leaderUserId: 'user-1',
    leaderUserName: '홍길동',
    missionaryId: MISSIONARY_ID,
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
    missionaryId: MISSIONARY_ID,
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

describe('TeamManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initialData로 렌더 시 스켈레톤이 노출되지 않고 즉시 데이터를 보여준다', () => {
    render(
      <TeamManagementPage
        mission={createMission()}
        initialTeams={[createTeam()]}
        initialParticipations={{ data: [createParticipation()], total: 1 }}
        initialRegions={{ data: [], total: 0 }}
      />,
    );

    expect(
      screen.queryByTestId('team-management-loading'),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('team-management-section')).toBeInTheDocument();
  });

  it('팀이 0개일 때 Empty State를 보여준다', () => {
    render(
      <TeamManagementPage
        mission={createMission()}
        initialTeams={[]}
        initialParticipations={{ data: [], total: 0 }}
        initialRegions={{ data: [], total: 0 }}
      />,
    );

    expect(screen.getByTestId('teams-empty-state')).toBeInTheDocument();
    expect(screen.getByText('팀이 아직 없습니다')).toBeInTheDocument();
  });

  it('팀이 존재하면 툴바(팀 수 + 미배치 수)와 칸반 보드를 보여준다', () => {
    render(
      <TeamManagementPage
        mission={createMission()}
        initialTeams={[
          createTeam({ id: 'team-1', teamName: '1팀' }),
          createTeam({ id: 'team-2', teamName: '2팀' }),
        ]}
        initialParticipations={{
          data: [
            createParticipation({ id: 'p-1', teamId: 'team-1' }),
            createParticipation({ id: 'p-2', teamId: null }),
            createParticipation({ id: 'p-3', teamId: null }),
          ],
          total: 3,
        }}
        initialRegions={{ data: [], total: 0 }}
      />,
    );

    expect(screen.getByTestId('team-management-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('team-count-badge')).toHaveTextContent('2팀');
    expect(screen.getByTestId('unassigned-count-badge')).toHaveTextContent(
      '2명',
    );
    expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
  });

  it('breadcrumb이 등록 상세 페이지로의 링크를 포함한다', () => {
    render(
      <TeamManagementPage
        mission={createMission({ name: '여름 선교' })}
        initialTeams={[]}
        initialParticipations={{ data: [], total: 0 }}
        initialRegions={{ data: [], total: 0 }}
      />,
    );

    const link = screen.getByRole('link', { name: /여름 선교/ });
    expect(link).toHaveAttribute('href', `/enrollment/${MISSIONARY_ID}`);
    expect(
      screen.getByRole('heading', { name: /여름 선교 · 팀 관리/ }),
    ).toBeInTheDocument();
  });
});
