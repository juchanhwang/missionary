import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import type {
  TermsCreateInput,
  TermsRepository,
  TermsUpdateInput,
} from './terms-repository.interface';
import type { Terms } from '../../../prisma/generated/prisma';

@Injectable()
export class PrismaTermsRepository implements TermsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: TermsCreateInput): Promise<Terms> {
    return this.prisma.terms.create({ data });
  }

  async findMany(args?: {
    where?: Partial<Terms>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<Terms[]> {
    return this.prisma.terms.findMany({
      where: args?.where,
      orderBy: args?.orderBy,
    });
  }

  async findUnique(where: Partial<Terms>): Promise<Terms | null> {
    return this.prisma.terms.findUnique({
      where: where as { id: string },
    });
  }

  async findFirst(where: Partial<Terms>): Promise<Terms | null> {
    return this.prisma.terms.findFirst({ where });
  }

  async update(where: Partial<Terms>, data: TermsUpdateInput): Promise<Terms> {
    return this.prisma.terms.update({
      where: where as { id: string },
      data,
    });
  }

  async delete(where: Partial<Terms>): Promise<Terms> {
    return this.prisma.terms.delete({
      where: where as { id: string },
    });
  }

  async count(where?: Partial<Terms>): Promise<number> {
    return this.prisma.terms.count({ where });
  }

  async findAllActive(): Promise<Terms[]> {
    return this.prisma.terms.findMany({
      where: { isUsed: true },
      orderBy: { seq: 'asc' },
    });
  }

  async findById(id: string): Promise<Terms | null> {
    return this.prisma.terms.findUnique({ where: { id } });
  }
}
