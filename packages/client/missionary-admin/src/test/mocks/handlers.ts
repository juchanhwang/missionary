import { http, HttpResponse } from 'msw';

import {
  createMockAttendanceOption,
  createMockAuthUser,
  createMockFormFieldDefinition,
  createMockMissionary,
  createMockMissionGroup,
  createMockMissionGroupDetail,
  createMockParticipation,
  createMockParticipationList,
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

  // Participations
  http.get(`${API_URL}/participations`, ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '10');
    return HttpResponse.json({
      data: createMockParticipationList(limit),
      total: 30,
    });
  }),

  http.get(`${API_URL}/participations/:id`, ({ params }) =>
    HttpResponse.json(createMockParticipation({ id: params.id as string })),
  ),

  http.patch(`${API_URL}/participations/:id`, ({ params }) =>
    HttpResponse.json(createMockParticipation({ id: params.id as string })),
  ),

  http.put(`${API_URL}/participations/approve`, () =>
    HttpResponse.json({ success: true }),
  ),

  // Attendance Options
  http.get(`${API_URL}/missionaries/:id/attendance-options`, () =>
    HttpResponse.json([
      createMockAttendanceOption(),
      createMockAttendanceOption({
        id: 'att-opt-2',
        type: 'PARTIAL',
        label: '부분 참석',
        order: 1,
      }),
    ]),
  ),

  http.post(`${API_URL}/missionaries/:id/attendance-options`, () =>
    HttpResponse.json(createMockAttendanceOption({ id: 'att-opt-new' }), {
      status: 201,
    }),
  ),

  http.patch(
    `${API_URL}/missionaries/:missionaryId/attendance-options/:optionId`,
    ({ params }) =>
      HttpResponse.json(
        createMockAttendanceOption({ id: params.optionId as string }),
      ),
  ),

  http.delete(
    `${API_URL}/missionaries/:missionaryId/attendance-options/:optionId`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  // Form Fields
  http.get(`${API_URL}/missionaries/:id/form-fields`, () =>
    HttpResponse.json([createMockFormFieldDefinition()]),
  ),

  http.post(`${API_URL}/missionaries/:id/form-fields`, () =>
    HttpResponse.json(createMockFormFieldDefinition({ id: 'field-new' }), {
      status: 201,
    }),
  ),

  http.patch(
    `${API_URL}/missionaries/:missionaryId/form-fields/:fieldId`,
    ({ params }) =>
      HttpResponse.json(
        createMockFormFieldDefinition({ id: params.fieldId as string }),
      ),
  ),

  http.delete(
    `${API_URL}/missionaries/:missionaryId/form-fields/:fieldId`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  http.patch(`${API_URL}/missionaries/:id/form-fields/reorder`, () =>
    HttpResponse.json({ success: true }),
  ),

  // Enrollment Summary
  http.get(`${API_URL}/participations/enrollment-summary/:id`, () =>
    HttpResponse.json({
      totalParticipants: 30,
      maxParticipants: 50,
      paidCount: 20,
      unpaidCount: 10,
      fullAttendanceCount: 25,
      partialAttendanceCount: 5,
    }),
  ),
];
