import type {
  UserCreateInput,
  UserRepository,
  UserUpdateInput,
} from '@/user/repositories/user-repository.interface';

import { BaseFakeRepository } from './base-fake-repository';

import type {
  AuthProvider,
  User,
  UserRole,
} from '../../../prisma/generated/prisma';

export class FakeUserRepository
  extends BaseFakeRepository<User, UserCreateInput, UserUpdateInput>
  implements UserRepository
{
  protected buildEntity(data: UserCreateInput): User {
    const now = this.now();
    return {
      id: data.id ?? this.generateId(),
      email: data.email ?? null,
      name: data.name ?? null,
      password: data.password ?? null,
      provider: data.provider ?? 'LOCAL',
      providerId: data.providerId ?? null,
      role: data.role ?? 'USER',
      loginId: data.loginId ?? null,
      identityNumber: data.identityNumber ?? null,
      phoneNumber: data.phoneNumber ?? null,
      birthDate:
        data.birthDate instanceof Date
          ? data.birthDate
          : data.birthDate
            ? new Date(data.birthDate)
            : null,
      gender: data.gender ?? null,
      isBaptized: data.isBaptized ?? false,
      baptizedAt:
        data.baptizedAt instanceof Date
          ? data.baptizedAt
          : data.baptizedAt
            ? new Date(data.baptizedAt)
            : null,
      createdAt: now,
      updatedAt: now,
      createdBy: null,
      updatedBy: null,
      version: 0,
      deletedAt: null,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return (
      [...this.store.values()].find((user) => user.email === email) ?? null
    );
  }

  async findByProvider(
    provider: AuthProvider,
    providerId: string,
  ): Promise<User | null> {
    return (
      [...this.store.values()].find(
        (user) => user.provider === provider && user.providerId === providerId,
      ) ?? null
    );
  }

  async findByLoginIdAndRole(
    loginId: string,
    role: UserRole,
  ): Promise<User | null> {
    return (
      [...this.store.values()].find(
        (user) => user.loginId === loginId && user.role === role,
      ) ?? null
    );
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(`Entity not found for update: ${JSON.stringify({ id })}`);
    }
    this.store.set(id, {
      ...existing,
      password: hashedPassword,
      updatedAt: new Date(),
    });
  }

  static withUsers(users: User[]): FakeUserRepository {
    const repo = new FakeUserRepository();
    for (const user of users) {
      repo.store.set(user.id, user);
    }
    return repo;
  }
}
