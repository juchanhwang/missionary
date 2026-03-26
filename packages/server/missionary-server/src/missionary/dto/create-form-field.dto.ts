import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

enum FormFieldTypeDto {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
  DATE = 'DATE',
}

export class CreateFormFieldDto {
  @IsEnum(FormFieldTypeDto)
  declare fieldType:
    | 'TEXT'
    | 'TEXTAREA'
    | 'NUMBER'
    | 'BOOLEAN'
    | 'SELECT'
    | 'DATE';

  @IsString()
  declare label: string;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsBoolean()
  declare isRequired: boolean;

  @IsInt()
  @Min(0)
  declare order: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];
}
