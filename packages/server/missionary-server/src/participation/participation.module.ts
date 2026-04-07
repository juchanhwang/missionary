import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { CsvExportService } from '@/common/csv/csv-export.service';
import { PiiCleanupScheduler } from '@/common/scheduler/pii-cleanup.scheduler';
import { PrismaModule } from '@/database/prisma.module';
import { MissionaryModule } from '@/missionary/missionary.module';
import { TeamModule } from '@/team/team.module';

import { ParticipationController } from './participation.controller';
import { ParticipationProcessor } from './participation.processor';
import { ParticipationService } from './participation.service';
import { FORM_ANSWER_REPOSITORY } from './repositories/form-answer-repository.interface';
import { PARTICIPATION_REPOSITORY } from './repositories/participation-repository.interface';
import { PrismaFormAnswerRepository } from './repositories/prisma-form-answer.repository';
import { PrismaParticipationRepository } from './repositories/prisma-participation.repository';

@Module({
  imports: [
    PrismaModule,
    MissionaryModule,
    TeamModule,
    BullModule.registerQueue({
      name: 'participation-queue',
    }),
  ],
  controllers: [ParticipationController],
  providers: [
    ParticipationService,
    ParticipationProcessor,
    CsvExportService,
    PiiCleanupScheduler,
    {
      provide: PARTICIPATION_REPOSITORY,
      useClass: PrismaParticipationRepository,
    },
    {
      provide: FORM_ANSWER_REPOSITORY,
      useClass: PrismaFormAnswerRepository,
    },
  ],
  exports: [ParticipationService],
})
export class ParticipationModule {}
