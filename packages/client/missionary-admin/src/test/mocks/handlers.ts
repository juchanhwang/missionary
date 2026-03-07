import { http, HttpResponse } from 'msw';

import {
  createMockAuthUser,
  createMockMissionary,
  createMockMissionGroup,
  createMockMissionGroupDetail,
  createMockUser,
  createMockUserList,
} from './data';

const API_URL = 'http://localhost';

export const handlers = [
  // Auth
  http.post(`${API_URL}/auth/login`, () =>
    HttpResponse.json({ token: 'mock-token' }),
  ),

  http.post(`${API_URL}/auth/logout`, () =>
    HttpResponse.json({ success: true }),
  ),

  http.get(`${API_URL}/auth/me`, () => HttpResponse.json(createMockAuthUser())),

  http.post(`${API_URL}/auth/refresh`, () =>
    HttpResponse.json({ token: 'refreshed-token' }),
  ),

  // Missionaries
  http.get(`${API_URL}/missionaries`, () =>
    HttpResponse.json([createMockMissionary()]),
  ),

  http.get(`${API_URL}/missionaries/:id`, ({ params }) =>
    HttpResponse.json(createMockMissionary({ id: params.id as string })),
  ),

  http.post(`${API_URL}/missionaries`, () =>
    HttpResponse.json(createMockMissionary({ id: 'new-missionary' }), {
      status: 201,
    }),
  ),

  http.patch(`${API_URL}/missionaries/:id`, ({ params }) =>
    HttpResponse.json(createMockMissionary({ id: params.id as string })),
  ),

  http.delete(`${API_URL}/missionaries/:id`, () =>
    HttpResponse.json({ deleted: true }),
  ),

  // Mission Groups
  http.get(`${API_URL}/mission-groups`, () =>
    HttpResponse.json([createMockMissionGroup()]),
  ),

  http.get(`${API_URL}/mission-groups/:id`, ({ params }) =>
    HttpResponse.json(
      createMockMissionGroupDetail({ id: params.id as string }),
    ),
  ),

  http.post(`${API_URL}/mission-groups`, () =>
    HttpResponse.json(createMockMissionGroup({ id: 'new-group' }), {
      status: 201,
    }),
  ),

  http.patch(`${API_URL}/mission-groups/:id`, ({ params }) =>
    HttpResponse.json(createMockMissionGroup({ id: params.id as string })),
  ),

  http.delete(`${API_URL}/mission-groups/:id`, () =>
    HttpResponse.json({ deleted: true }),
  ),

  // Users
  http.get(`${API_URL}/users`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10');
    const users = createMockUserList(pageSize);
    return HttpResponse.json({
      data: users,
      total: 30,
      page,
      pageSize,
    });
  }),

  http.get(`${API_URL}/users/:id`, ({ params }) =>
    HttpResponse.json(createMockUser({ id: params.id as string })),
  ),

  http.patch(`${API_URL}/users/:id`, ({ params }) =>
    HttpResponse.json(createMockUser({ id: params.id as string })),
  ),

  http.delete(
    `${API_URL}/users/:id`,
    () => new HttpResponse(null, { status: 204 }),
  ),
];
