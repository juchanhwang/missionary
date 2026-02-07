import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { CreateMissionDto } from './create-mission.dto';
import { MissionStatus } from '../../../prisma/generated/prisma/enums';

export class UpdateMissionDto extends PartialType(CreateMissionDto) {
  @ApiProperty({
    enum: ['RECRUITING', 'IN_PROGRESS', 'COMPLETED'],
    required: false,
  })
  @IsEnum(MissionStatus)
  @IsOptional()
  declare status?: MissionStatus;
}
