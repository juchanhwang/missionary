import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { CsvExportService } from '@/common/csv/csv-export.service';
import { PiiCleanupScheduler } from '@/common/scheduler/pii-cleanup.scheduler';
import { PrismaModule } from '@/database/prisma.module';
import { MissionaryModule } from '@/missionary/missionary.module';

import { ParticipationController } from './participation.controller';
import { ParticipationProcessor } from './participation.processor';
import { ParticipationService } from './participation.service';
import { PARTICIPATION_REPOSITORY } from './repositories/participation-repository.interface';
import { PrismaParticipationRepository } from './repositories/prisma-participation.repository';

@Module({
  imports: [
    PrismaModule,
    MissionaryModule,
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
  ],
  exports: [ParticipationService],
})
export class ParticipationModule {}
