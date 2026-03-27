import {
  IsUUID,
  IsString,
  IsDateString,
  IsInt,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateParticipationDto {
  @IsUUID()
  declare missionaryId: string;

  @IsString()
  declare name: string;

  @IsDateString()
  declare birthDate: string;

  @IsInt()
  declare applyFee: number;

  @IsString()
  declare identificationNumber: string;

  @IsBoolean()
  declare isOwnCar: boolean;

  @IsString()
  declare affiliation: string;

  @IsUUID()
  declare attendanceOptionId: string;

  @IsInt()
  @Min(1)
  declare cohort: number;

  @IsOptional()
  @IsBoolean()
  hasPastParticipation?: boolean;

  @IsOptional()
  @IsBoolean()
  isCollegeStudent?: boolean;
}
