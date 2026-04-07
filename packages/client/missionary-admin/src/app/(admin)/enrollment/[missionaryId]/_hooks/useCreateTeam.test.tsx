import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { type PropsWithChildren } from 'react';
import { toast } from 'sonner';
import { server } from 'test/mocks/server';
import { vi } from 'vitest';

import { useCreateTeam } from './useCreateTeam';

import type { CreateTeamPayload, Team } from 'apis/team';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const API_URL = 'http://localhost';

function createTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: 'team-new',
    teamName: '신규팀',
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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return { queryClient, Wrapper };
}

describe('useCreateTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 teams.list(missionaryId) 캐시를 invalidate하고 토스트를 띄운다', async () => {
    server.use(
      http.post(`${API_URL}/teams`, () =>
        HttpResponse.json(createTeam(), { status: 201 }),
      ),
    );

    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateTeam(), { wrapper: Wrapper });

    const payload: CreateTeamPayload = {
      missionaryId: 'missionary-1',
      teamName: '신규팀',
      leaderUserId: 'user-1',
      leaderUserName: '홍길동',
    };

    result.current.mutate(payload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['teams', 'list', 'missionary-1'],
    });
    expect(toast.success).toHaveBeenCalledWith('팀이 생성되었습니다.');
  });

  it('실패 시 에러 토스트를 띄운다', async () => {
    server.use(
      http.post(`${API_URL}/teams`, () =>
        HttpResponse.json({ message: 'Bad Request' }, { status: 400 }),
      ),
    );

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateTeam(), { wrapper: Wrapper });

    result.current.mutate({
      missionaryId: 'missionary-1',
      teamName: '신규팀',
      leaderUserId: 'user-1',
      leaderUserName: '홍길동',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalledWith(
      '팀 생성에 실패했습니다. 다시 시도해주세요.',
    );
  });
});
