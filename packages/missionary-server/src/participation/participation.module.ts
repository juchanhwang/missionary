import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { PrismaModule } from '@/database/prisma.module';

import { ParticipationController } from './participation.controller';
import { ParticipationProcessor } from './participation.processor';
import { ParticipationService } from './participation.service';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'participation-queue',
    }),
  ],
  controllers: [ParticipationController],
  providers: [ParticipationService, ParticipationProcessor],
  exports: [ParticipationService],
})
export class ParticipationModule {}
