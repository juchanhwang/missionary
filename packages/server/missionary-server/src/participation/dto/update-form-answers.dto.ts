import { Type } from 'class-transformer';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';

export class FormAnswerItemDto {
  @IsUUID()
  declare formFieldId: string;

  @IsString()
  declare value: string;
}

export class UpdateFormAnswersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormAnswerItemDto)
  declare answers: FormAnswerItemDto[];
}
