import { http, HttpResponse } from 'msw';
import { server } from 'test/mocks/server';
import { render, screen, waitFor } from 'test/test-utils';
import { vi } from 'vitest';

import { TeamCreateModal } from './TeamCreateModal';

import type { RegionListItem } from 'apis/missionaryRegion';
import type { Participation } from 'apis/participation';

const API_URL = 'http://localhost';
const MISSIONARY_ID = 'missionary-1';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

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

const REGIONS: RegionListItem[] = [];
const PARTICIPATIONS: Participation[] = [
  createParticipation({ userId: 'user-1', name: '홍길동' }),
  createParticipation({ id: 'p-2', userId: 'user-2', name: '김철수' }),
];

describe('TeamCreateModal', () => {
  it('제목과 필수 입력 필드를 렌더한다', () => {
    render(
      <TeamCreateModal
        isOpen={true}
        close={vi.fn()}
        missionaryId={MISSIONARY_ID}
        participations={PARTICIPATIONS}
        regions={REGIONS}
      />,
    );

    expect(
      screen.getByRole('heading', { name: '팀 추가', hidden: true }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('팀 이름 *')).toBeInTheDocument();
  });

  it('팀 이름만 입력하고 제출하면 팀장 미선택 에러를 표시한다', async () => {
    let requestCount = 0;
    server.use(
      http.post(`${API_URL}/teams`, () => {
        requestCount += 1;
        return HttpResponse.json({});
      }),
    );

    const close = vi.fn();
    const { user } = render(
      <TeamCreateModal
        isOpen={true}
        close={close}
        missionaryId={MISSIONARY_ID}
        participations={PARTICIPATIONS}
        regions={REGIONS}
      />,
    );

    await user.type(screen.getByLabelText('팀 이름 *'), '새 팀');
    await user.click(
      screen.getByRole('button', { name: '팀 생성', hidden: true }),
    );

    await waitFor(() => {
      expect(screen.getByText('팀장을 선택해주세요')).toBeInTheDocument();
    });
    expect(requestCount).toBe(0);
    expect(close).not.toHaveBeenCalled();
  });

  it('팀 이름 공란으로 제출하면 팀 이름 에러를 표시한다', async () => {
    const { user } = render(
      <TeamCreateModal
        isOpen={true}
        close={vi.fn()}
        missionaryId={MISSIONARY_ID}
        participations={PARTICIPATIONS}
        regions={REGIONS}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: '팀 생성', hidden: true }),
    );

    await waitFor(() => {
      expect(screen.getByText('팀 이름을 입력해주세요')).toBeInTheDocument();
    });
  });

  it('취소 버튼 클릭 시 close(false)를 호출한다', async () => {
    const close = vi.fn();
    const { user } = render(
      <TeamCreateModal
        isOpen={true}
        close={close}
        missionaryId={MISSIONARY_ID}
        participations={PARTICIPATIONS}
        regions={REGIONS}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: '취소', hidden: true }),
    );

    expect(close).toHaveBeenCalledWith(false);
  });

  it('다른 팀에 이미 배치된 참가자는 팀장 후보에서 보이지 않는다', async () => {
    const assignedParticipation = createParticipation({
      id: 'p-3',
      userId: 'user-3',
      name: '박영희',
      teamId: 'team-2',
      team: { id: 'team-2', teamName: '2팀' },
    });

    const { user } = render(
      <TeamCreateModal
        isOpen={true}
        close={vi.fn()}
        missionaryId={MISSIONARY_ID}
        participations={[...PARTICIPATIONS, assignedParticipation]}
        regions={REGIONS}
      />,
    );

    await user.click(screen.getByText('등록자 중 선택'));

    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('김철수')).toBeInTheDocument();
    expect(screen.queryByText('박영희')).not.toBeInTheDocument();
  });

  it('isOpen=false면 내용을 렌더하지 않는다', () => {
    render(
      <TeamCreateModal
        isOpen={false}
        close={vi.fn()}
        missionaryId={MISSIONARY_ID}
        participations={PARTICIPATIONS}
        regions={REGIONS}
      />,
    );

    expect(
      screen.queryByRole('heading', { name: '팀 추가', hidden: true }),
    ).not.toBeInTheDocument();
  });
});
