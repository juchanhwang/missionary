import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { CreateParticipationDto } from './create-participation.dto';
import { FormAnswerItemDto } from './update-form-answers.dto';

export class UpdateParticipationDto extends PartialType(
  CreateParticipationDto,
) {
  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormAnswerItemDto)
  answers?: FormAnswerItemDto[];

  // 팀 배치/해제. null 허용 (배치 해제).
  // class-validator의 @IsUUID()는 null을 거부하므로 ValidateIf로 우회한다.
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  teamId?: string | null;
}
