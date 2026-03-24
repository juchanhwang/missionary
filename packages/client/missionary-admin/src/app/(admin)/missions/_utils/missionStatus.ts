import { type MissionStatus } from 'apis/missionary';

export const MISSION_STATUS_LABEL: Record<MissionStatus, string> = {
  ENROLLMENT_OPENED: '모집 중',
  ENROLLMENT_CLOSED: '모집 종료',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
};
