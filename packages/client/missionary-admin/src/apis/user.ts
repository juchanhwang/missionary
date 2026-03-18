import api from './instance';
import { stripEmpty } from './utils';

export type AuthProvider = 'LOCAL' | 'GOOGLE' | 'KAKAO';

export type UserRole = 'USER' | 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  phoneNumber: string | null;
  identityNumber: string | null;
  loginId: string | null;
  provider: AuthProvider | null;
  role: UserRole;
  gender: string | null;
  birthDate: string | null;
  isBaptized: boolean;
  baptizedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UserSearchType = 'name' | 'loginId' | 'phone';

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  searchType?: UserSearchType | '';
  keyword?: string;
  role?: UserRole | '';
  provider?: AuthProvider | '';
  isBaptized?: string;
}

export interface PaginatedUsersResponse {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UpdateUserPayload {
  name?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: string;
  isBaptized?: boolean;
  baptizedAt?: string;
  role?: UserRole;
}

export const userApi = {
  getUsers(params?: GetUsersParams) {
    return api.get<PaginatedUsersResponse>('/users', {
      params: params ? stripEmpty(params) : undefined,
    });
  },

  getUser(id: string) {
    return api.get<User>(`/users/${id}`);
  },

  updateUser(id: string, data: UpdateUserPayload) {
    return api.patch<User>(`/users/${id}`, data);
  },

  deleteUser(id: string) {
    return api.delete(`/users/${id}`);
  },
};
