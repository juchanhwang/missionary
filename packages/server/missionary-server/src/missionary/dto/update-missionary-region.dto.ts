import { PartialType } from '@nestjs/mapped-types';

import { CreateMissionaryRegionDto } from './create-missionary-region.dto';

export class UpdateMissionaryRegionDto extends PartialType(
  CreateMissionaryRegionDto,
) {}
