import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
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
}
