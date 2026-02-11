import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateMissionGroupDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['DOMESTIC', 'ABROAD'])
  type!: 'DOMESTIC' | 'ABROAD';
}
