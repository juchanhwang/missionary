import 'server-only';

import { createServerApi } from './serverInstance';

import type { GetEnrollmentSummaryResponse } from './enrollment';

export async function getServerEnrollmentSummary() {
  const serverApi = await createServerApi();
  const { data } = await serverApi.get<GetEnrollmentSummaryResponse>(
    '/enrollment/summary',
  );
  return data;
}
