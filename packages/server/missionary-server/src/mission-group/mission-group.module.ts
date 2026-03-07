import { Module } from '@nestjs/common';

import { MISSIONARY_REPOSITORY } from '@/missionary/repositories/missionary-repository.interface';
import { PrismaMissionaryRepository } from '@/missionary/repositories/prisma-missionary.repository';

import { MissionGroupController } from './mission-group.controller';
import { MissionGroupService } from './mission-group.service';
import { MISSION_GROUP_REPOSITORY } from './repositories/mission-group-repository.interface';
import { PrismaMissionGroupRepository } from './repositories/prisma-mission-group.repository';

@Module({
  controllers: [MissionGroupController],
  providers: [
    MissionGroupService,
    {
      provide: MISSION_GROUP_REPOSITORY,
      useClass: PrismaMissionGroupRepository,
    },
    {
      provide: MISSIONARY_REPOSITORY,
      useClass: PrismaMissionaryRepository,
    },
  ],
  exports: [MissionGroupService],
})
export class MissionGroupModule {}
