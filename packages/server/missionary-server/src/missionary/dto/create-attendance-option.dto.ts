import { IsEnum, IsInt, IsString, Min } from 'class-validator';

enum AttendanceTypeDto {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
}

export class CreateAttendanceOptionDto {
  @IsEnum(AttendanceTypeDto)
  declare type: 'FULL' | 'PARTIAL';

  @IsString()
  declare label: string;

  @IsInt()
  @Min(0)
  declare order: number;
}
