import { Module } from '@nestjs/common';

import { PrismaTermsAgreementRepository } from './repositories/prisma-terms-agreement.repository';
import { PrismaTermsRepository } from './repositories/prisma-terms.repository';
import { TERMS_AGREEMENT_REPOSITORY } from './repositories/terms-agreement-repository.interface';
import { TERMS_REPOSITORY } from './repositories/terms-repository.interface';
import { TermsController } from './terms.controller';
import { TermsService } from './terms.service';

@Module({
  controllers: [TermsController],
  providers: [
    TermsService,
    { provide: TERMS_REPOSITORY, useClass: PrismaTermsRepository },
    {
      provide: TERMS_AGREEMENT_REPOSITORY,
      useClass: PrismaTermsAgreementRepository,
    },
  ],
  exports: [TermsService],
})
export class TermsModule {}
