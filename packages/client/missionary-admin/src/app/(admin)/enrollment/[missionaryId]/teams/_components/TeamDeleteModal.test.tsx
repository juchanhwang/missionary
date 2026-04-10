import { http, HttpResponse } from 'msw';
import { server } from 'test/mocks/server';
import { render, screen, waitFor } from 'test/test-utils';
import { vi } from 'vitest';

import { TeamDeleteModal } from './TeamDeleteModal';

import type { Team } from 'apis/team';

const API_URL = 'http://localhost';

// sonner toast — DOM 렌더를 피하기 위해 mock.
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

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

describe('TeamDeleteModal', () => {
  it('배치 인원이 0명이면 경고 박스 대신 일반 안내를 표시한다', () => {
    render(
      <TeamDeleteModal
        isOpen={true}
        close={vi.fn()}
        team={createTeam({ teamName: '비어있는 팀' })}
        memberCount={0}
      />,
    );

    expect(screen.getByTestId('team-delete-modal')).toBeInTheDocument();
    expect(screen.getByText(/비어있는 팀/)).toBeInTheDocument();
    expect(
      screen.getByText('삭제한 팀은 복구할 수 없습니다.'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('team-delete-warning')).not.toBeInTheDocument();
  });

  it('배치 인원이 1명 이상이면 경고 박스를 표시한다', () => {
    render(
      <TeamDeleteModal
        isOpen={true}
        close={vi.fn()}
        team={createTeam({ teamName: '풍성한 팀' })}
        memberCount={3}
      />,
    );

    const warning = screen.getByTestId('team-delete-warning');
    expect(warning).toBeInTheDocument();
    expect(warning).toHaveTextContent('3명');
    expect(warning).toHaveTextContent('미배치 상태로 돌아갑니다');
  });

  it('취소 버튼 클릭 시 close(false)를 호출한다', async () => {
    const close = vi.fn();
    const { user } = render(
      <TeamDeleteModal
        isOpen={true}
        close={close}
        team={createTeam()}
        memberCount={0}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: '취소', hidden: true }),
    );

    expect(close).toHaveBeenCalledWith(false);
  });

  it('삭제 버튼 클릭 시 DELETE /teams/:id 호출 후 close(true)', async () => {
    let receivedId: string | null = null;
    server.use(
      http.delete(`${API_URL}/teams/:id`, ({ params }) => {
        receivedId = params.id as string;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const close = vi.fn();
    const { user } = render(
      <TeamDeleteModal
        isOpen={true}
        close={close}
        team={createTeam({ id: 'team-42' })}
        memberCount={0}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: '삭제', hidden: true }),
    );

    await waitFor(() => {
      expect(close).toHaveBeenCalledWith(true);
    });
    expect(receivedId).toBe('team-42');
  });

  it('isOpen=false면 내용을 렌더하지 않는다', () => {
    render(
      <TeamDeleteModal
        isOpen={false}
        close={vi.fn()}
        team={createTeam()}
        memberCount={0}
      />,
    );

    expect(screen.queryByTestId('team-delete-modal')).not.toBeInTheDocument();
  });
});
