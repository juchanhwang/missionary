import api from './instance';

import type { AttendanceOption } from './participation';

// === 타입 정의 ===

export type { AttendanceOption };

export interface CreateAttendanceOptionPayload {
  type: 'FULL' | 'PARTIAL';
  label: string;
}

export interface UpdateAttendanceOptionPayload {
  label?: string;
}

// === API 함수 ===

export const attendanceOptionApi = {
  getAttendanceOptions(missionaryId: string) {
    return api.get<AttendanceOption[]>(
      `/missionaries/${missionaryId}/attendance-options`,
    );
  },

  createAttendanceOption(
    missionaryId: string,
    data: CreateAttendanceOptionPayload,
  ) {
    return api.post<AttendanceOption>(
      `/missionaries/${missionaryId}/attendance-options`,
      data,
    );
  },

  updateAttendanceOption(
    missionaryId: string,
    optionId: string,
    data: UpdateAttendanceOptionPayload,
  ) {
    return api.patch<AttendanceOption>(
      `/missionaries/${missionaryId}/attendance-options/${optionId}`,
      data,
    );
  },

  deleteAttendanceOption(missionaryId: string, optionId: string) {
    return api.delete(
      `/missionaries/${missionaryId}/attendance-options/${optionId}`,
    );
  },
};
