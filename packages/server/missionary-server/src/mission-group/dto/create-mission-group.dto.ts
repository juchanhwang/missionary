import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateMissionGroupDto {
  @ApiProperty({ example: '군선교', description: '선교 그룹 이름' })
  @IsString()
  name!: string;

  @ApiProperty({
    example: '군선교 그룹입니다',
    description: '선교 그룹 설명',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: ['DOMESTIC', 'ABROAD'],
    description: '선교 카테고리 (국내/해외)',
  })
  @IsEnum(['DOMESTIC', 'ABROAD'])
  category!: 'DOMESTIC' | 'ABROAD';
}
