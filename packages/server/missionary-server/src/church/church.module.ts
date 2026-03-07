import { Module } from '@nestjs/common';

import { PrismaModule } from '@/database/prisma.module';

import { ChurchController } from './church.controller';
import { ChurchService } from './church.service';
import { CHURCH_REPOSITORY } from './repositories/church-repository.interface';
import { PrismaChurchRepository } from './repositories/prisma-church.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ChurchController],
  providers: [
    ChurchService,
    { provide: CHURCH_REPOSITORY, useClass: PrismaChurchRepository },
  ],
  exports: [ChurchService],
})
export class ChurchModule {}
