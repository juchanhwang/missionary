import { http, HttpResponse } from 'msw';
import { server } from 'test/mocks/server';
import { render, screen, waitFor } from 'test/test-utils';
import { vi } from 'vitest';

import { TeamEditModal } from './TeamEditModal';

import type { RegionListItem } from 'apis/missionaryRegion';
import type { Participation } from 'apis/participation';
import type { Team } from 'apis/team';

const API_URL = 'http://localhost';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function createTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: 'team-1',
    teamName: '기존 팀',
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
    name: '홍길동',
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

const REGIONS: RegionListItem[] = [];
const PARTICIPATIONS: Participation[] = [
  createParticipation({ userId: 'user-1', name: '홍길동' }),
  createParticipation({ id: 'p-2', userId: 'user-2', name: '김철수' }),
];

describe('TeamEditModal', () => {
  it('기존 팀 이름이 InputField에 pre-fill 된다', () => {
    render(
      <TeamEditModal
        isOpen={true}
        close={vi.fn()}
        team={createTeam({ teamName: '1차 선교팀' })}
        participations={PARTICIPATIONS}
        regions={REGIONS}
      />,
    );

    const input = screen.getByLabelText('팀 이름 *') as HTMLInputElement;
    expect(input.value).toBe('1차 선교팀');
    expect(
      screen.getByRole('heading', { name: '팀 수정', hidden: true }),
    ).toBeInTheDocument();
  });

  it('저장 버튼 클릭 시 PATCH /teams/:id 호출 + close(true)', async () => {
    let receivedBody: unknown = null;
    let receivedId: string | null = null;
    let assignRequest: unknown = null;
    server.use(
      http.patch(`${API_URL}/teams/:id`, async ({ params, request }) => {
        receivedId = params.id as string;
        receivedBody = await request.json();
        return HttpResponse.json(createTeam({ id: params.id as string }));
      }),
      http.patch(
        `${API_URL}/participations/:id`,
        async ({ params, request }) => {
          assignRequest = {
            id: params.id,
            body: await request.json(),
          };
          return HttpResponse.json({});
        },
      ),
    );

    const close = vi.fn();
    const { user } = render(
      <TeamEditModal
        isOpen={true}
        close={close}
        team={createTeam({ id: 'team-42', teamName: '원본' })}
        participations={PARTICIPATIONS}
        regions={REGIONS}
      />,
    );

    const input = screen.getByLabelText('팀 이름 *');
    await user.clear(input);
    await user.type(input, '수정된 팀');

    await user.click(
      screen.getByRole('button', { name: '저장', hidden: true }),
    );

    await waitFor(() => {
      expect(close).toHaveBeenCalledWith(true);
    });
    expect(receivedId).toBe('team-42');
    expect(receivedBody).toMatchObject({
      teamName: '수정된 팀',
      leaderUserId: 'user-1',
      leaderUserName: '홍길동',
    });
    expect(assignRequest).toEqual({
      id: 'p-1',
      body: { teamId: 'team-42' },
    });
  });

  it('취소 버튼 클릭 시 close(false)를 호출한다', async () => {
    const close = vi.fn();
    const { user } = render(
      <TeamEditModal
        isOpen={true}
        close={close}
        team={createTeam()}
        participations={PARTICIPATIONS}
        regions={REGIONS}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: '취소', hidden: true }),
    );

    expect(close).toHaveBeenCalledWith(false);
  });

  it('팀 이름을 비우면 validation 에러로 요청이 발생하지 않는다', async () => {
    let requestCount = 0;
    server.use(
      http.patch(`${API_URL}/teams/:id`, () => {
        requestCount += 1;
        return HttpResponse.json({});
      }),
    );

    const close = vi.fn();
    const { user } = render(
      <TeamEditModal
        isOpen={true}
        close={close}
        team={createTeam({ teamName: '원본' })}
        participations={PARTICIPATIONS}
        regions={REGIONS}
      />,
    );

    const input = screen.getByLabelText('팀 이름 *');
    await user.clear(input);
    await user.click(
      screen.getByRole('button', { name: '저장', hidden: true }),
    );

    await waitFor(() => {
      expect(screen.getByText('팀 이름을 입력해주세요')).toBeInTheDocument();
    });
    expect(requestCount).toBe(0);
    expect(close).not.toHaveBeenCalled();
  });

  it('현재 팀 소속 참가자는 팀장 후보로 유지하고 다른 팀 소속 참가자는 제외한다', async () => {
    const currentTeamMember = createParticipation({
      id: 'p-3',
      userId: 'user-3',
      name: '이현재',
      teamId: 'team-1',
      team: { id: 'team-1', teamName: '기존 팀' },
    });
    const otherTeamMember = createParticipation({
      id: 'p-4',
      userId: 'user-4',
      name: '최다른',
      teamId: 'team-2',
      team: { id: 'team-2', teamName: '다른 팀' },
    });

    const { user } = render(
      <TeamEditModal
        isOpen={true}
        close={vi.fn()}
        team={createTeam()}
        participations={[...PARTICIPATIONS, currentTeamMember, otherTeamMember]}
        regions={REGIONS}
      />,
    );

    await user.click(screen.getByText('홍길동'));

    expect(screen.getAllByText('홍길동')).toHaveLength(2);
    expect(screen.getByText('이현재')).toBeInTheDocument();
    expect(screen.queryByText('최다른')).not.toBeInTheDocument();
  });
});
