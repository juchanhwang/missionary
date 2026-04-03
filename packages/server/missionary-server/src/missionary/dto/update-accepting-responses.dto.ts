import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAcceptingResponsesDto {
  @ApiProperty({
    example: false,
    description: '등록 수신 여부 (false이면 신규 등록 차단)',
  })
  @IsBoolean()
  declare isAcceptingResponses: boolean;

  @ApiProperty({
    example: '현재 등록을 일시적으로 중단하고 있습니다.',
    description: '일시 중지 시 사용자에게 표시할 메시지 (null이면 기본 문구)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  declare closedMessage?: string | null;
}
