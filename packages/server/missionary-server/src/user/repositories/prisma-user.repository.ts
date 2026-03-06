import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import type {
  UserCreateInput,
  UserRepository,
  UserUpdateInput,
} from './user-repository.interface';
import type {
  AuthProvider,
  User,
  UserRole,
} from '../../../prisma/generated/prisma';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findMany(args?: {
    where?: Partial<User>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<User[]> {
    return this.prisma.user.findMany({
      where: args?.where,
      orderBy: args?.orderBy,
    });
  }

  async findUnique(where: Partial<User>): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: where as { id: string } | { email: string },
    });
  }

  async findFirst(where: Partial<User>): Promise<User | null> {
    return this.prisma.user.findFirst({ where });
  }

  async update(where: Partial<User>, data: UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: where as { id: string },
      data,
    });
  }

  async delete(where: Partial<User>): Promise<User> {
    return this.prisma.user.delete({
      where: where as { id: string },
    });
  }

  async count(where?: Partial<User>): Promise<number> {
    return this.prisma.user.count({ where });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByProvider(
    provider: AuthProvider,
    providerId: string,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { provider, providerId } });
  }

  async findByLoginIdAndRole(
    loginId: string,
    role: UserRole,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { loginId, role } });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }
}
