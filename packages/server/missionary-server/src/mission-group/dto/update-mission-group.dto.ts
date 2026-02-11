import { PartialType } from '@nestjs/mapped-types';

import { CreateMissionGroupDto } from './create-mission-group.dto';

export class UpdateMissionGroupDto extends PartialType(CreateMissionGroupDto) {}
