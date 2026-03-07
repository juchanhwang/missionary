import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import type {
  ChurchCreateInput,
  ChurchRepository,
  ChurchUpdateInput,
} from './church-repository.interface';
import type { Church } from '../../../prisma/generated/prisma';

@Injectable()
export class PrismaChurchRepository implements ChurchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ChurchCreateInput): Promise<Church> {
    return this.prisma.church.create({ data });
  }

  async findMany(args?: {
    where?: Partial<Church>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<Church[]> {
    return this.prisma.church.findMany({
      where: args?.where,
      orderBy: args?.orderBy,
    });
  }

  async findUnique(where: Partial<Church>): Promise<Church | null> {
    return this.prisma.church.findUnique({
      where: where as { id: string },
    });
  }

  async findFirst(where: Partial<Church>): Promise<Church | null> {
    return this.prisma.church.findFirst({ where });
  }

  async update(
    where: Partial<Church>,
    data: ChurchUpdateInput,
  ): Promise<Church> {
    return this.prisma.church.update({
      where: where as { id: string },
      data,
    });
  }

  async delete(where: Partial<Church>): Promise<Church> {
    return this.prisma.church.delete({
      where: where as { id: string },
    });
  }

  async count(where?: Partial<Church>): Promise<number> {
    return this.prisma.church.count({ where });
  }

  async findAll(): Promise<Church[]> {
    return this.prisma.church.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Church | null> {
    return this.prisma.church.findUnique({
      where: { id },
    });
  }
}
