import type {
  PaginatedResult,
  UserCreateInput,
  UserPaginationArgs,
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
      [...this.store.values()].find(
        (user) => user.email === email && user.deletedAt === null,
      ) ?? null
    );
  }

  async findByProvider(
    provider: AuthProvider,
    providerId: string,
  ): Promise<User | null> {
    return (
      [...this.store.values()].find(
        (user) =>
          user.provider === provider &&
          user.providerId === providerId &&
          user.deletedAt === null,
      ) ?? null
    );
  }

  async findByLoginIdAndRole(
    loginId: string,
    role: UserRole,
  ): Promise<User | null> {
    return (
      [...this.store.values()].find(
        (user) =>
          user.loginId === loginId &&
          user.role === role &&
          user.deletedAt === null,
      ) ?? null
    );
  }

  async findManyWithPagination(
    args: UserPaginationArgs,
  ): Promise<PaginatedResult<User>> {
    let results = [...this.store.values()];

    if (args.where) {
      results = results.filter((item) => {
        return Object.entries(args.where!).every(([key, value]) => {
          if (value === null) {
            return (item as Record<string, unknown>)[key] === null;
          }
          if (
            typeof value === 'object' &&
            value !== null &&
            'contains' in value
          ) {
            const itemVal = (item as Record<string, unknown>)[key];
            if (typeof itemVal === 'string') {
              return itemVal.includes((value as { contains: string }).contains);
            }
            return false;
          }
          if (typeof value === 'object' && value !== null && 'OR' in value) {
            return false;
          }
          return (item as Record<string, unknown>)[key] === value;
        });
      });

      // OR 조건 처리
      if (args.where['OR'] && Array.isArray(args.where['OR'])) {
        const baseResults = [...this.store.values()];
        const orConditions = args.where['OR'] as Record<string, unknown>[];
        const nonOrWhere = { ...args.where };
        delete nonOrWhere['OR'];

        results = baseResults.filter((item) => {
          // 먼저 OR 이외의 조건을 충족하는지 확인
          const matchesNonOr = Object.entries(nonOrWhere).every(
            ([key, value]) => {
              if (value === null) {
                return (item as Record<string, unknown>)[key] === null;
              }
              return (item as Record<string, unknown>)[key] === value;
            },
          );
          if (!matchesNonOr) return false;

          // OR 조건 중 하나라도 충족하는지 확인
          return orConditions.some((condition) => {
            return Object.entries(condition).every(([key, value]) => {
              if (
                typeof value === 'object' &&
                value !== null &&
                'contains' in value
              ) {
                const itemVal = (item as Record<string, unknown>)[key];
                if (typeof itemVal === 'string') {
                  return itemVal.includes(
                    (value as { contains: string }).contains,
                  );
                }
                return false;
              }
              return (item as Record<string, unknown>)[key] === value;
            });
          });
        });
      }
    }

    if (args.orderBy) {
      const entries = Object.entries(args.orderBy);
      if (entries.length > 0) {
        const [key, direction] = entries[0];
        results.sort((a, b) => {
          const aVal = (a as Record<string, unknown>)[key];
          const bVal = (b as Record<string, unknown>)[key];
          if (aVal instanceof Date && bVal instanceof Date) {
            return direction === 'asc'
              ? aVal.getTime() - bVal.getTime()
              : bVal.getTime() - aVal.getTime();
          }
          const aStr = String(aVal ?? '');
          const bStr = String(bVal ?? '');
          if (aStr < bStr) return direction === 'asc' ? -1 : 1;
          if (aStr > bStr) return direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    const total = results.length;
    const skip = args.skip ?? 0;
    const take = args.take ?? results.length;
    const data = results.slice(skip, skip + take);

    return { data, total };
  }

  async softDelete(id: string): Promise<User> {
    const existing = this.store.get(id);
    if (!existing) {
      throw new Error(
        `Entity not found for soft delete: ${JSON.stringify({ id })}`,
      );
    }
    const updated = {
      ...existing,
      deletedAt: new Date(),
      updatedAt: new Date(),
    };
    this.store.set(id, updated);
    return updated;
  }

  async countActiveAdmins(): Promise<number> {
    return [...this.store.values()].filter(
      (user) => user.role === 'ADMIN' && user.deletedAt === null,
    ).length;
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

  seed(user: User): void {
    this.store.set(user.id, user);
  }

  static withUsers(users: User[]): FakeUserRepository {
    const repo = new FakeUserRepository();
    for (const user of users) {
      repo.store.set(user.id, user);
    }
    return repo;
  }
}
