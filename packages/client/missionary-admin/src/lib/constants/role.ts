import type { UserRole } from 'apis/user';

export const ROLE_LABELS: Record<UserRole, string> = {
  USER: '사용자',
  STAFF: '스태프',
  ADMIN: '관리자',
};
