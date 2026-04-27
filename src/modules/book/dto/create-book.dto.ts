import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsString()
  authorId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  genreIds!: string[];

  @IsOptional()
  @IsDateString()
  publishedDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  pages?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  language?: string;
}
