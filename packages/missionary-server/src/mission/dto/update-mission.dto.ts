import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { MissionStatus } from '../../../prisma/generated/prisma/enums';
import { CreateMissionDto } from './create-mission.dto';

export class UpdateMissionDto extends PartialType(CreateMissionDto) {
  @ApiProperty({
    enum: ['RECRUITING', 'IN_PROGRESS', 'COMPLETED'],
    required: false,
  })
  @IsEnum(MissionStatus)
  @IsOptional()
  declare status?: MissionStatus;
}
