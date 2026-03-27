import { Module } from '@nestjs/common';

import { PrismaModule } from '@/database/prisma.module';
import { MISSION_GROUP_REPOSITORY } from '@/mission-group/repositories/mission-group-repository.interface';
import { PrismaMissionGroupRepository } from '@/mission-group/repositories/prisma-mission-group.repository';

import { AttendanceOptionController } from './attendance-option.controller';
import { AttendanceOptionService } from './attendance-option.service';
import { FormFieldController } from './form-field.controller';
import { FormFieldService } from './form-field.service';
import { MissionGroupRegionController } from './mission-group-region.controller';
import { MissionaryController } from './missionary.controller';
import { MissionaryService } from './missionary.service';
import { RegionController } from './region.controller';
import { ATTENDANCE_OPTION_REPOSITORY } from './repositories/attendance-option-repository.interface';
import { FORM_FIELD_REPOSITORY } from './repositories/form-field-repository.interface';
import { MISSIONARY_POSTER_REPOSITORY } from './repositories/missionary-poster-repository.interface';
import { MISSIONARY_REGION_REPOSITORY } from './repositories/missionary-region-repository.interface';
import { MISSIONARY_REPOSITORY } from './repositories/missionary-repository.interface';
import { PrismaAttendanceOptionRepository } from './repositories/prisma-attendance-option.repository';
import { PrismaFormFieldRepository } from './repositories/prisma-form-field.repository';
import { PrismaMissionaryPosterRepository } from './repositories/prisma-missionary-poster.repository';
import { PrismaMissionaryRegionRepository } from './repositories/prisma-missionary-region.repository';
import { PrismaMissionaryRepository } from './repositories/prisma-missionary.repository';

@Module({
  imports: [PrismaModule],
  controllers: [
    MissionaryController,
    RegionController,
    MissionGroupRegionController,
    AttendanceOptionController,
    FormFieldController,
  ],
  providers: [
    MissionaryService,
    AttendanceOptionService,
    FormFieldService,
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
    {
      provide: ATTENDANCE_OPTION_REPOSITORY,
      useClass: PrismaAttendanceOptionRepository,
    },
    {
      provide: FORM_FIELD_REPOSITORY,
      useClass: PrismaFormFieldRepository,
    },
  ],
  exports: [
    MissionaryService,
    FormFieldService,
    MISSIONARY_REPOSITORY,
    ATTENDANCE_OPTION_REPOSITORY,
    FORM_FIELD_REPOSITORY,
  ],
})
export class MissionaryModule {}
