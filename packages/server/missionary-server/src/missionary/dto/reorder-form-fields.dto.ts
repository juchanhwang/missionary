import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

class ReorderItem {
  @IsUUID()
  declare id: string;

  @IsInt()
  @Min(0)
  declare order: number;
}

export class ReorderFormFieldsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  declare items: ReorderItem[];
}
