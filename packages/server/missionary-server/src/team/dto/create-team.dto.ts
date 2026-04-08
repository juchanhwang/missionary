import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({
    example: 'uuid-string',
    description: '선교 ID',
  })
  @IsUUID()
  declare missionaryId: string;

  @ApiProperty({
    example: 'uuid-string',
    description: '교회 ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  declare churchId?: string;

  @ApiProperty({
    example: 'uuid-string',
    description: '팀장 사용자 ID',
  })
  @IsUUID()
  declare leaderUserId: string;

  @ApiProperty({
    example: '김팀장',
    description: '팀장 사용자 이름',
  })
  @IsString()
  declare leaderUserName: string;

  @ApiProperty({
    example: '1팀',
    description: '팀 이름',
  })
  @IsString()
  declare teamName: string;

  @ApiProperty({
    example: 'uuid-string',
    description: '연계지 ID (optional)',
    required: false,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  declare missionaryRegionId?: string | null;
}
