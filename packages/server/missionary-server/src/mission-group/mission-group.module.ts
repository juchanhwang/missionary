import { Module } from '@nestjs/common';

import { MissionGroupController } from './mission-group.controller';
import { MissionGroupService } from './mission-group.service';

@Module({
  controllers: [MissionGroupController],
  providers: [MissionGroupService],
  exports: [MissionGroupService],
})
export class MissionGroupModule {}
