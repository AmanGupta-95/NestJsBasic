import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateAuthorDto {
  @IsString()
  name: string;

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
