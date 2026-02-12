import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentPassword123', description: '현재 비밀번호' })
  @IsString()
  @IsNotEmpty()
  declare currentPassword: string;

  @ApiProperty({ example: 'newPassword123', description: '새 비밀번호' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  declare newPassword: string;
}
