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
  Query,
  UsePipes,
} from '@nestjs/common';
import { BookService } from './book.service';
import { createBookSchema } from './dto/create-book.dto';
import type { CreateBookDto } from './dto/create-book.dto';
import { updateBookSchema } from './dto/update-book.dto';
import type { UpdateBookDto } from './dto/update-book.dto';
import { JoiValidationPipe } from '../../common/pipes/joi-validation.pipe';

@Controller('/books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new JoiValidationPipe(createBookSchema))
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  @Get()
  findAll(
    @Query('authorId') authorId?: string,
    @Query('genreId') genreId?: string,
  ) {
    return this.bookService.findAll(authorId, genreId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new JoiValidationPipe(updateBookSchema))
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.bookService.update(id, updateBookDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.bookService.remove(id);
  }
}
