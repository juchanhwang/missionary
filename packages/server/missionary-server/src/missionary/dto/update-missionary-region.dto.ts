import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import { CreateMissionaryRegionDto } from './create-missionary-region.dto';

export class UpdateMissionaryRegionDto extends PartialType(
  CreateMissionaryRegionDto,
) {
  @ApiProperty({
    example: 'uuid-of-missionary',
    description: '소속 차수(선교) ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  declare missionaryId?: string;
}
