import api from './instance';

import type { UserRole } from './user';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  provider: string;
}

export const authApi = {
  login(email: string, password: string) {
    return api.post('/auth/login', { email, password });
  },

  logout() {
    return api.post('/auth/logout');
  },

  getMe() {
    return api.get<AuthUser>('/auth/me');
  },

  refresh() {
    return api.post('/auth/refresh');
  },
};
