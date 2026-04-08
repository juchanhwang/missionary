import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from 'test/mocks/server';
import { render, screen, waitFor } from 'test/test-utils';

import { TeamManagementSection } from './TeamManagementSection';

import type { Participation } from 'apis/participation';
import type { Team } from 'apis/team';

const API_URL = 'http://localhost';
const MISSIONARY_ID = 'missionary-1';

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

describe('TeamManagementSection', () => {
  it('팀과 참가자를 동시에 불러오는 동안 로딩 스켈레톤을 보여준다', () => {
    server.use(
      http.get(`${API_URL}/teams`, async () => {
        // 응답 지연으로 로딩 상태 유지
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json([]);
      }),
      http.get(`${API_URL}/participations`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({ data: [], total: 0 });
      }),
    );

    render(
      <TeamManagementSection
        missionaryId={MISSIONARY_ID}
        missionGroupId={null}
      />,
    );

    expect(screen.getByTestId('team-management-loading')).toBeInTheDocument();
  });

  it('팀이 0개일 때 Empty State를 보여준다', async () => {
    server.use(
      http.get(`${API_URL}/teams`, () => HttpResponse.json([])),
      http.get(`${API_URL}/participations`, () =>
        HttpResponse.json({ data: [], total: 0 }),
      ),
    );

    render(
      <TeamManagementSection
        missionaryId={MISSIONARY_ID}
        missionGroupId={null}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('teams-empty-state')).toBeInTheDocument();
    });
    expect(screen.getByText('팀이 아직 없습니다')).toBeInTheDocument();
  });

  it('팀이 존재하면 툴바(팀 수 + 미배치 수)와 칸반 보드를 보여준다', async () => {
    server.use(
      http.get(`${API_URL}/teams`, () =>
        HttpResponse.json([
          createTeam({ id: 'team-1', teamName: '1팀' }),
          createTeam({ id: 'team-2', teamName: '2팀' }),
        ]),
      ),
      http.get(`${API_URL}/participations`, () =>
        HttpResponse.json({
          data: [
            createParticipation({ id: 'p-1', teamId: 'team-1' }),
            createParticipation({ id: 'p-2', teamId: null }),
            createParticipation({ id: 'p-3', teamId: null }),
          ],
          total: 3,
        }),
      ),
    );

    render(
      <TeamManagementSection
        missionaryId={MISSIONARY_ID}
        missionGroupId={null}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('team-management-toolbar')).toBeInTheDocument();
    });

    expect(screen.getByTestId('team-count-badge')).toHaveTextContent('2팀');
    expect(screen.getByTestId('unassigned-count-badge')).toHaveTextContent(
      '2명',
    );
    expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
  });

  it('팀 조회 실패 시 에러 상태를 보여준다', async () => {
    server.use(
      http.get(`${API_URL}/teams`, () =>
        HttpResponse.json({ message: 'Server Error' }, { status: 500 }),
      ),
      http.get(`${API_URL}/participations`, () =>
        HttpResponse.json({ data: [], total: 0 }),
      ),
    );

    render(
      <TeamManagementSection
        missionaryId={MISSIONARY_ID}
        missionGroupId={null}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('team-management-error')).toBeInTheDocument();
    });
  });

  it('에러 상태의 "다시 시도" 버튼을 누르면 refetch가 실행된다', async () => {
    let teamsCallCount = 0;
    server.use(
      http.get(`${API_URL}/teams`, () => {
        teamsCallCount += 1;
        if (teamsCallCount === 1) {
          return HttpResponse.json(
            { message: 'Server Error' },
            { status: 500 },
          );
        }
        return HttpResponse.json([
          createTeam({ id: 'team-1', teamName: '1팀' }),
        ]);
      }),
      http.get(`${API_URL}/participations`, () =>
        HttpResponse.json({ data: [], total: 0 }),
      ),
    );

    render(
      <TeamManagementSection
        missionaryId={MISSIONARY_ID}
        missionGroupId={null}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('team-management-error')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('team-management-error-retry'));

    await waitFor(() => {
      expect(screen.getByTestId('kanban-board')).toBeInTheDocument();
    });
    expect(teamsCallCount).toBeGreaterThanOrEqual(2);
  });
});
