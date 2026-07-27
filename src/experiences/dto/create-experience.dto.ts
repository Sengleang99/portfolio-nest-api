import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ExperienceStatus } from '../enums/experience-status.enum';

export class CreateExperienceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  position: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  company: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  from_year: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  to_year?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  descr?: string;

  @IsEnum(ExperienceStatus, {
    message: `status must be one of: ${Object.values(ExperienceStatus).join(', ')}`,
  })
  @IsNotEmpty()
  status: ExperienceStatus;
}
