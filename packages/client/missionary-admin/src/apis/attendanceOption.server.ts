import { cache } from 'react';
import 'server-only';

import { createServerApi } from './serverInstance';

import type { AttendanceOption } from './participation';

export const getServerAttendanceOptions = cache(
  async (missionaryId: string) => {
    const serverApi = await createServerApi();
    const { data } = await serverApi.get<AttendanceOption[]>(
      `/missionaries/${missionaryId}/attendance-options`,
    );
    return data;
  },
);
