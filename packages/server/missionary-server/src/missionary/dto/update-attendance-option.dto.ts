import { PartialType } from '@nestjs/mapped-types';

import { CreateAttendanceOptionDto } from './create-attendance-option.dto';

export class UpdateAttendanceOptionDto extends PartialType(
  CreateAttendanceOptionDto,
) {}
