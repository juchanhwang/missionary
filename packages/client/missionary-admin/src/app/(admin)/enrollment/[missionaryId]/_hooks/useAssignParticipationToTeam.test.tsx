import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import {
  type PaginatedParticipationsResponse,
  type Participation,
} from 'apis/participation';
import { queryKeys } from 'lib/queryKeys';
import { http, HttpResponse } from 'msw';
import { type PropsWithChildren } from 'react';
import { toast } from 'sonner';
import { server } from 'test/mocks/server';
import { vi } from 'vitest';

import { useAssignParticipationToTeam } from './useAssignParticipationToTeam';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const API_URL = 'http://localhost';

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
    missionaryId: 'm-1',
    userId: 'u-1',
    teamId: null,
    team: null,
    createdAt: '2026-04-01T00:00:00.000Z',
    affiliation: 'church',
    attendanceOptionId: 'att-1',
    attendanceOption: null,
    cohort: 12,
    hasPastParticipation: null,
    isCollegeStudent: null,
    formAnswers: [],
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

describe('useAssignParticipationToTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 participations 캐시의 teamId를 optimistic 업데이트하고 invalidate한다', async () => {
    let receivedId: string | null = null;
    let receivedBody: unknown = null;

    server.use(
      http.patch(
        `${API_URL}/participations/:id`,
        async ({ params, request }) => {
          receivedId = params.id as string;
          receivedBody = await request.json();
          return HttpResponse.json(
            createParticipation({ id: 'p-1', teamId: 'team-a' }),
          );
        },
      ),
    );

    const { queryClient, Wrapper } = createWrapper();

    const queryKey = queryKeys.participations.list({ missionaryId: 'm-1' });
    const initialSnapshot: PaginatedParticipationsResponse = {
      data: [createParticipation({ id: 'p-1', teamId: null })],
      total: 1,
    };
    queryClient.setQueryData<PaginatedParticipationsResponse>(
      queryKey,
      initialSnapshot,
    );

    const cancelQueriesSpy = vi.spyOn(queryClient, 'cancelQueries');
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useAssignParticipationToTeam(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ participationId: 'p-1', teamId: 'team-a' });

    // onMutate가 동기적으로 실행한 optimistic update를 확인한다.
    await waitFor(() => {
      const cached =
        queryClient.getQueryData<PaginatedParticipationsResponse>(queryKey);
      expect(cached?.data[0].teamId).toBe('team-a');
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(receivedId).toBe('p-1');
    expect(receivedBody).toEqual({ teamId: 'team-a' });
    // in-flight 쿼리가 optimistic update를 덮어쓰지 않도록 onMutate에서 취소해야 한다.
    expect(cancelQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.participations.all,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.participations.all,
    });
    // 성공 시에는 토스트를 띄우지 않는다(드래그 노이즈 방지).
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('실패 시 snapshot을 복원하고 에러 토스트를 띄운다', async () => {
    server.use(
      http.patch(`${API_URL}/participations/:id`, () =>
        HttpResponse.json({ message: 'Server Error' }, { status: 500 }),
      ),
    );

    const { queryClient, Wrapper } = createWrapper();

    const queryKey = queryKeys.participations.list({ missionaryId: 'm-1' });
    const initialSnapshot: PaginatedParticipationsResponse = {
      data: [createParticipation({ id: 'p-1', teamId: null })],
      total: 1,
    };
    queryClient.setQueryData<PaginatedParticipationsResponse>(
      queryKey,
      initialSnapshot,
    );

    const { result } = renderHook(() => useAssignParticipationToTeam(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ participationId: 'p-1', teamId: 'team-a' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const rolledBack =
      queryClient.getQueryData<PaginatedParticipationsResponse>(queryKey);
    expect(rolledBack?.data[0].teamId).toBeNull();
    expect(toast.error).toHaveBeenCalledWith(
      '팀 배치에 실패했습니다. 다시 시도해주세요.',
    );
  });

  it('teamId=null로 호출하면 해제로 동작한다(팀 → 미배치)', async () => {
    let receivedBody: unknown = null;

    server.use(
      http.patch(`${API_URL}/participations/:id`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json(
          createParticipation({ id: 'p-1', teamId: null }),
        );
      }),
    );

    const { queryClient, Wrapper } = createWrapper();
    const queryKey = queryKeys.participations.list({ missionaryId: 'm-1' });
    queryClient.setQueryData<PaginatedParticipationsResponse>(queryKey, {
      data: [createParticipation({ id: 'p-1', teamId: 'team-x' })],
      total: 1,
    });

    const { result } = renderHook(() => useAssignParticipationToTeam(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ participationId: 'p-1', teamId: null });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(receivedBody).toEqual({ teamId: null });

    const cached =
      queryClient.getQueryData<PaginatedParticipationsResponse>(queryKey);
    expect(cached?.data[0].teamId).toBeNull();
  });
});
