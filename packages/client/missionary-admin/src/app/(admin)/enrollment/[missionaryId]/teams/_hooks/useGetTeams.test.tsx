import { http, HttpResponse } from 'msw';
import { server } from 'test/mocks/server';
import { renderHook, waitFor } from 'test/test-utils';

import { useGetTeams } from './useGetTeams';

import type { Team } from 'apis/team';

const API_URL = 'http://localhost';

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

describe('useGetTeams', () => {
  it('missionaryId로 팀 목록을 조회한다', async () => {
    server.use(
      http.get(`${API_URL}/teams`, () =>
        HttpResponse.json([
          createTeam({ id: 'team-1', teamName: '1팀' }),
          createTeam({ id: 'team-2', teamName: '2팀' }),
        ]),
      ),
    );

    const { result } = renderHook(() =>
      useGetTeams({ missionaryId: 'missionary-1' }),
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([
      expect.objectContaining({ id: 'team-1', teamName: '1팀' }),
      expect.objectContaining({ id: 'team-2', teamName: '2팀' }),
    ]);
  });

  it('initialData가 주어지면 즉시 사용한다', () => {
    const initialData: Team[] = [createTeam({ id: 'seed-team' })];

    const { result } = renderHook(() =>
      useGetTeams({ missionaryId: 'missionary-1', initialData }),
    );

    expect(result.current.data).toEqual(initialData);
  });

  it('API 에러 시 에러 상태를 반환한다', async () => {
    server.use(
      http.get(`${API_URL}/teams`, () =>
        HttpResponse.json({ message: 'Server Error' }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() =>
      useGetTeams({ missionaryId: 'missionary-1' }),
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
