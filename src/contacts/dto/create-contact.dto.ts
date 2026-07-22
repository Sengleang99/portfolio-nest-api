import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;
}
