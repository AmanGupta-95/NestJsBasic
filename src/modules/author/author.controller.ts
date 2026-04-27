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
import { AuthorService } from './author.service';
import { createAuthorSchema } from './dto/create-author.dto';
import type { CreateAuthorDto } from './dto/create-author.dto';
import { updateAuthorSchema } from './dto/update-author.dto';
import type { UpdateAuthorDto } from './dto/update-author.dto';
import { Public } from '../auth/guards/public.decorator';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';

@Controller('/api/authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new JoiValidationPipe(createAuthorSchema))
  create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorService.create(createAuthorDto);
  }

  @Get()
  findAll() {
    return this.authorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authorService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new JoiValidationPipe(updateAuthorSchema))
  update(@Param('id') id: string, @Body() updateAuthorDto: UpdateAuthorDto) {
    return this.authorService.update(id, updateAuthorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.authorService.remove(id);
  }
}
