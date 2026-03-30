import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { type PropsWithChildren } from 'react';
import { server } from 'test/mocks/server';

import { useTogglePayment } from './useTogglePayment';

import type {
  PaginatedParticipationsResponse,
  Participation,
} from 'apis/participation';

const API_URL = 'http://localhost';

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

function createParticipation(
  overrides: Partial<Participation> = {},
): Participation {
  return {
    id: 'part-1',
    name: '홍길동',
    birthDate: '1999-01-01',
    applyFee: 500000,
    isPaid: false,
    identificationNumber: null,
    isOwnCar: false,
    missionaryId: 'missionary-1',
    userId: 'user-1',
    teamId: null,
    team: null,
    createdAt: '2026-03-01T00:00:00.000Z',
    affiliation: '서울교회',
    attendanceOptionId: 'att-opt-1',
    attendanceOption: null,
    cohort: 1,
    hasPastParticipation: false,
    isCollegeStudent: false,
    formAnswers: [],
    ...overrides,
  };
}

describe('useTogglePayment', () => {
  it('성공 시 캐시를 낙관적으로 업데이트한다', async () => {
    server.use(
      http.patch(`${API_URL}/participations/:id`, () =>
        HttpResponse.json(createParticipation({ isPaid: true })),
      ),
    );

    const { queryClient, Wrapper } = createWrapper();

    // 초기 캐시 데이터 세팅
    const initialData: PaginatedParticipationsResponse = {
      data: [
        createParticipation({ id: 'part-1', isPaid: false }),
        createParticipation({ id: 'part-2', isPaid: true }),
      ],
      total: 2,
    };
    queryClient.setQueryData(['participations', 'list', {}], initialData);

    const { result } = renderHook(() => useTogglePayment(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ id: 'part-1', isPaid: true });

    // 낙관적 업데이트 확인
    await waitFor(() => {
      const cached =
        queryClient.getQueriesData<PaginatedParticipationsResponse>({
          queryKey: ['participations'],
        });

      const allData = cached.flatMap(([, data]) => data?.data ?? []);
      const updated = allData.find((p) => p.id === 'part-1');
      expect(updated?.isPaid).toBe(true);
    });
  });

  it('실패 시 이전 데이터로 롤백한다', async () => {
    server.use(
      http.patch(`${API_URL}/participations/:id`, () =>
        HttpResponse.json({ message: 'Error' }, { status: 500 }),
      ),
    );

    const { queryClient, Wrapper } = createWrapper();

    const initialData: PaginatedParticipationsResponse = {
      data: [createParticipation({ id: 'part-1', isPaid: false })],
      total: 1,
    };
    queryClient.setQueryData(['participations', 'list', {}], initialData);

    const { result } = renderHook(() => useTogglePayment(), {
      wrapper: Wrapper,
    });

    result.current.mutate({ id: 'part-1', isPaid: true });

    // 에러 후 롤백 확인
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const cached = queryClient.getQueriesData<PaginatedParticipationsResponse>({
      queryKey: ['participations'],
    });

    const allData = cached.flatMap(([, data]) => data?.data ?? []);
    const rolledBack = allData.find((p) => p.id === 'part-1');
    expect(rolledBack?.isPaid).toBe(false);
  });
});
