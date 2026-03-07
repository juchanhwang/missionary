import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { UserRole } from '@/common/enums/user-role.enum';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    enum: UserRole,
    description: '사용자 역할 (ADMIN만 변경 가능)',
    required: false,
  })
  @IsEnum(UserRole)
  @IsOptional()
  declare role?: UserRole;
}
