import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { type PropsWithChildren } from 'react';
import { toast } from 'sonner';
import { server } from 'test/mocks/server';
import { vi } from 'vitest';

import { useDeleteTeam } from './useDeleteTeam';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

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

describe('useDeleteTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 teams.all + participations.all을 invalidate하고 토스트를 띄운다', async () => {
    server.use(
      http.delete(
        `${API_URL}/teams/:id`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    );

    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeleteTeam(), { wrapper: Wrapper });

    result.current.mutate('team-1');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['teams'] });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['participations'],
    });
    expect(toast.success).toHaveBeenCalledWith('팀이 삭제되었습니다.');
  });

  it('실패 시 에러 토스트를 띄운다', async () => {
    server.use(
      http.delete(`${API_URL}/teams/:id`, () =>
        HttpResponse.json({ message: 'Conflict' }, { status: 409 }),
      ),
    );

    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteTeam(), { wrapper: Wrapper });

    result.current.mutate('team-1');

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalledWith(
      '팀 삭제에 실패했습니다. 다시 시도해주세요.',
    );
  });
});
