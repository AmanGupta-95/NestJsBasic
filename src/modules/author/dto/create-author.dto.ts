import {
  IsString,
  IsOptional,
  IsDateString,
  IsEmail,
  MinLength,
} from 'class-validator';

export class CreateAuthorDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  nationality?: string;
}
