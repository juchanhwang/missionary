import type { BaseRepository } from '@/common/repositories';

import type {
  AuthProvider,
  Prisma,
  User,
  UserRole,
} from '../../../prisma/generated/prisma';

export interface UserCreateInput {
  id?: string;
  email?: string | null;
  name?: string | null;
  password?: string | null;
  provider?: AuthProvider | null;
  providerId?: string | null;
  role?: UserRole;
  loginId?: string | null;
  identityNumber?: string | null;
  phoneNumber?: string | null;
  birthDate?: Date | string | null;
  gender?: string | null;
  isBaptized?: boolean;
  baptizedAt?: Date | string | null;
}

export interface UserUpdateInput {
  email?: string | null;
  name?: string | null;
  password?: string | null;
  role?: UserRole;
  loginId?: string | null;
  identityNumber?: string | null;
  phoneNumber?: string | null;
  birthDate?: Date | string | null;
  gender?: string | null;
  isBaptized?: boolean;
  baptizedAt?: Date | string | null;
}

export interface UserPaginationArgs {
  skip?: number;
  take?: number;
  where?: Prisma.UserWhereInput;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface UserRepository extends BaseRepository<
  User,
  UserCreateInput,
  UserUpdateInput
> {
  findByEmail(email: string): Promise<User | null>;
  findByProvider(
    provider: AuthProvider,
    providerId: string,
  ): Promise<User | null>;
  findByLoginIdAndRole(loginId: string, role: UserRole): Promise<User | null>;
  updatePassword(id: string, hashedPassword: string): Promise<void>;
  findManyWithPagination(
    args: UserPaginationArgs,
  ): Promise<PaginatedResult<User>>;
  softDelete(id: string): Promise<User>;
  countActiveAdmins(): Promise<number>;
  /**
   * 트랜잭션 내에서 ADMIN 수를 확인하고 soft delete를 수행한다.
   * 마지막 ADMIN이면 삭제하지 않고 null을 반환한다.
   */
  softDeleteIfNotLastAdmin(id: string): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
