import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateEducationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  degree: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  major: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  university: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  start_year: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  end_year?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  descr?: string;
}
