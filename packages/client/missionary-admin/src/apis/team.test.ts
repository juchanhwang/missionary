import { http, HttpResponse } from 'msw';
import { server } from 'test/mocks/server';

import {
  type CreateTeamPayload,
  type Team,
  type UpdateTeamPayload,
  teamApi,
} from './team';

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

describe('teamApi', () => {
  describe('getTeams', () => {
    it('missionaryId 쿼리 파라미터로 GET /teams를 호출한다', async () => {
      let capturedUrl: string | null = null;
      server.use(
        http.get(`${API_URL}/teams`, ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json([createTeam()]);
        }),
      );

      const response = await teamApi.getTeams('missionary-1');

      expect(capturedUrl).not.toBeNull();
      const url = new URL(capturedUrl!);
      expect(url.pathname).toBe('/teams');
      expect(url.searchParams.get('missionaryId')).toBe('missionary-1');
      expect(response.data).toEqual([
        expect.objectContaining({ id: 'team-1', teamName: '1팀' }),
      ]);
    });
  });

  describe('createTeam', () => {
    it('필수 필드를 포함한 payload로 POST /teams를 호출한다', async () => {
      let capturedBody: unknown = null;
      server.use(
        http.post(`${API_URL}/teams`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json(createTeam({ id: 'team-new' }), {
            status: 201,
          });
        }),
      );

      const payload: CreateTeamPayload = {
        missionaryId: 'missionary-1',
        teamName: '신규팀',
        leaderUserId: 'user-1',
        leaderUserName: '홍길동',
      };

      const response = await teamApi.createTeam(payload);

      expect(capturedBody).toEqual(payload);
      expect(response.data.id).toBe('team-new');
    });

    it('선택 필드(churchId, missionaryRegionId)도 그대로 전달한다', async () => {
      let capturedBody: unknown = null;
      server.use(
        http.post(`${API_URL}/teams`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json(createTeam(), { status: 201 });
        }),
      );

      const payload: CreateTeamPayload = {
        missionaryId: 'missionary-1',
        teamName: '1팀',
        leaderUserId: 'user-1',
        leaderUserName: '홍길동',
        churchId: 'church-1',
        missionaryRegionId: 'region-1',
      };

      await teamApi.createTeam(payload);

      expect(capturedBody).toEqual(payload);
    });
  });

  describe('updateTeam', () => {
    it('id를 URL에 포함하고 부분 payload로 PATCH /teams/:id를 호출한다', async () => {
      let capturedBody: unknown = null;
      let capturedUrl: string | null = null;
      server.use(
        http.patch(`${API_URL}/teams/:id`, async ({ request }) => {
          capturedUrl = request.url;
          capturedBody = await request.json();
          return HttpResponse.json(createTeam({ teamName: '수정된 팀명' }));
        }),
      );

      const payload: UpdateTeamPayload = { teamName: '수정된 팀명' };
      const response = await teamApi.updateTeam('team-1', payload);

      expect(capturedUrl).not.toBeNull();
      expect(new URL(capturedUrl!).pathname).toBe('/teams/team-1');
      expect(capturedBody).toEqual(payload);
      expect(response.data.teamName).toBe('수정된 팀명');
    });
  });

  describe('deleteTeam', () => {
    it('id를 URL에 포함하여 DELETE /teams/:id를 호출한다', async () => {
      let capturedUrl: string | null = null;
      server.use(
        http.delete(`${API_URL}/teams/:id`, ({ request }) => {
          capturedUrl = request.url;
          return new HttpResponse(null, { status: 204 });
        }),
      );

      await teamApi.deleteTeam('team-1');

      expect(capturedUrl).not.toBeNull();
      expect(new URL(capturedUrl!).pathname).toBe('/teams/team-1');
    });
  });
});
