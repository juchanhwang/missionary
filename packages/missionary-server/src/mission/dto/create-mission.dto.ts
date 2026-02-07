import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsDateString } from 'class-validator';

import { MissionType } from '../../../prisma/generated/prisma/enums';

export class CreateMissionDto {
  @ApiProperty({ example: '2024 제주선교', description: '선교 이름' })
  @IsString()
  @IsNotEmpty()
  declare name: string;

  @ApiProperty({ enum: ['DOMESTIC', 'OVERSEAS'], description: '선교 유형' })
  @IsEnum(MissionType)
  declare type: MissionType;

  @ApiProperty({ example: '2024-07-01', description: '시작일' })
  @IsDateString()
  declare startDate: string;

  @ApiProperty({ example: '2024-07-07', description: '종료일' })
  @IsDateString()
  declare endDate: string;

  @ApiProperty({ example: '김목사', description: '담당 교역자 이름' })
  @IsString()
  @IsNotEmpty()
  declare pastorName: string;
}
