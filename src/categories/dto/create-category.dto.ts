import {
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  icon?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  descr?: string;

  @IsString()
  @IsNotEmpty()
  @IsHexColor({
    message: 'color must be a valid hex color code (e.g. #FF5733)',
  })
  color: string;
}
