import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { GenreService } from './genre.service';
import { createGenreSchema } from './dto/create-genre.dto';
import type { CreateGenreDto } from './dto/create-genre.dto';
import { updateGenreSchema } from './dto/update-genre.dto';
import type { UpdateGenreDto } from './dto/update-genre.dto';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';

@Controller('/api/genres')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new JoiValidationPipe(createGenreSchema))
  create(@Body() createGenreDto: CreateGenreDto) {
    return this.genreService.create(createGenreDto);
  }

  @Get()
  findAll() {
    return this.genreService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.genreService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new JoiValidationPipe(updateGenreSchema))
  update(@Param('id') id: string, @Body() updateGenreDto: UpdateGenreDto) {
    return this.genreService.update(id, updateGenreDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.genreService.remove(id);
  }
}
