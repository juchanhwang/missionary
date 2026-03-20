import { Module } from '@nestjs/common';

import { PrismaModule } from '@/database/prisma.module';
import { MISSION_GROUP_REPOSITORY } from '@/mission-group/repositories/mission-group-repository.interface';
import { PrismaMissionGroupRepository } from '@/mission-group/repositories/prisma-mission-group.repository';

import { MissionGroupRegionController } from './mission-group-region.controller';
import { MissionaryController } from './missionary.controller';
import { MissionaryService } from './missionary.service';
import { RegionController } from './region.controller';
import { MISSIONARY_POSTER_REPOSITORY } from './repositories/missionary-poster-repository.interface';
import { MISSIONARY_REGION_REPOSITORY } from './repositories/missionary-region-repository.interface';
import { MISSIONARY_REPOSITORY } from './repositories/missionary-repository.interface';
import { PrismaMissionaryPosterRepository } from './repositories/prisma-missionary-poster.repository';
import { PrismaMissionaryRegionRepository } from './repositories/prisma-missionary-region.repository';
import { PrismaMissionaryRepository } from './repositories/prisma-missionary.repository';

@Module({
  imports: [PrismaModule],
  controllers: [
    MissionaryController,
    RegionController,
    MissionGroupRegionController,
  ],
  providers: [
    MissionaryService,
    {
      provide: MISSIONARY_REPOSITORY,
      useClass: PrismaMissionaryRepository,
    },
    {
      provide: MISSIONARY_REGION_REPOSITORY,
      useClass: PrismaMissionaryRegionRepository,
    },
    {
      provide: MISSIONARY_POSTER_REPOSITORY,
      useClass: PrismaMissionaryPosterRepository,
    },
    {
      provide: MISSION_GROUP_REPOSITORY,
      useClass: PrismaMissionGroupRepository,
    },
  ],
  exports: [MissionaryService, MISSIONARY_REPOSITORY],
})
export class MissionaryModule {}
