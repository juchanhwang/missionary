import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

import type { AuthProvider, UserRole } from '../../../prisma/generated/prisma';

export class FindAllUsersQueryDto {
  @ApiPropertyOptional({
    description: '페이지 번호 (1부터 시작)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare page?: number;

  @ApiPropertyOptional({
    description: '페이지당 항목 수',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  declare pageSize?: number;

  @ApiPropertyOptional({
    description: '검색 대상 필드 (keyword와 함께 전달 필수)',
    enum: ['name', 'loginId', 'phone'],
    example: 'name',
  })
  @ValidateIf((o) => o.keyword !== undefined)
  @IsEnum(['name', 'loginId', 'phone'] as const)
  declare searchType?: 'name' | 'loginId' | 'phone';

  @ApiPropertyOptional({
    description: '검색어 (searchType과 함께 전달 필수)',
    example: '홍길동',
  })
  @ValidateIf((o) => o.searchType !== undefined)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  declare keyword?: string;

  @ApiPropertyOptional({
    description: '역할 필터',
    enum: ['USER', 'ADMIN', 'STAFF'],
    example: 'ADMIN',
  })
  @IsOptional()
  @IsEnum(['USER', 'ADMIN', 'STAFF'] as const)
  declare role?: UserRole;

  @ApiPropertyOptional({
    description: '인증 제공자 필터',
    enum: ['LOCAL', 'GOOGLE', 'KAKAO'],
    example: 'GOOGLE',
  })
  @IsOptional()
  @IsEnum(['LOCAL', 'GOOGLE', 'KAKAO'] as const)
  declare provider?: AuthProvider;

  @ApiPropertyOptional({
    description: '세례 여부 필터',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  declare isBaptized?: boolean;
}
