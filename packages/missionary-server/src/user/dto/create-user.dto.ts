import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: '이메일 주소' })
  @IsEmail()
  @IsNotEmpty()
  declare email: string;

  @ApiProperty({
    example: '홍길동',
    description: '사용자 이름',
    required: false,
  })
  @IsString()
  @IsOptional()
  declare name?: string;
}
