import type { BaseRepository } from '@/common/repositories';

import type {
  AuthProvider,
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
  loginId?: string | null;
  identityNumber?: string | null;
  phoneNumber?: string | null;
  birthDate?: Date | string | null;
  gender?: string | null;
  isBaptized?: boolean;
  baptizedAt?: Date | string | null;
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
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
