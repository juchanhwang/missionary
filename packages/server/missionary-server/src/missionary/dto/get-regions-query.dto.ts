import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class GetRegionsQueryDto {
  @ApiPropertyOptional({ description: '선교 그룹 ID 필터' })
  @IsOptional()
  @IsUUID()
  declare missionGroupId?: string;

  @ApiPropertyOptional({ description: '검색어 (이름, 목사명)' })
  @IsOptional()
  @IsString()
  declare query?: string;

  @ApiPropertyOptional({ description: '페이지 크기', default: 20 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : 20))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ description: '오프셋', default: 0 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value, 10) : 0))
  @IsInt()
  @Min(0)
  offset: number = 0;
}
