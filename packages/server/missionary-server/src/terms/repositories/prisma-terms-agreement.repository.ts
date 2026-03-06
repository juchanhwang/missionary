import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma.service';

import type {
  AgreementCreateInput,
  AgreementWithRelations,
  TermsAgreementRepository,
} from './terms-agreement-repository.interface';
import type { UserTermsAgreement } from '../../../prisma/generated/prisma';

@Injectable()
export class PrismaTermsAgreementRepository implements TermsAgreementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTermsAndUser(
    termsId: string,
    userId: string,
  ): Promise<UserTermsAgreement | null> {
    return this.prisma.userTermsAgreement.findFirst({
      where: { termsId, userId },
    });
  }

  async createWithRelations(
    data: AgreementCreateInput,
  ): Promise<AgreementWithRelations> {
    return this.prisma.userTermsAgreement.create({
      data: {
        termsId: data.termsId,
        userId: data.userId,
        isAgreed: data.isAgreed ?? true,
      },
      include: {
        terms: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async findByUser(userId: string): Promise<AgreementWithRelations[]> {
    return this.prisma.userTermsAgreement.findMany({
      where: { userId },
      include: {
        terms: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
