import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenreService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGenreDto: CreateGenreDto) {
    try {
      return await this.prisma.genre.create({
        data: createGenreDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `Genre with name "${createGenreDto.name}" already exists`,
        );
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.genre.findMany({
      include: {
        books: {
          include: {
            book: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
      include: {
        books: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!genre) {
      throw new NotFoundException(`Genre with ID ${id} not found`);
    }

    return genre;
  }

  async update(id: string, updateGenreDto: UpdateGenreDto) {
    await this.findOne(id); // Ensure genre exists

    try {
      return await this.prisma.genre.update({
        where: { id },
        data: updateGenreDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `Genre with name "${updateGenreDto.name}" already exists`,
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure genre exists

    // Check if genre has books
    const booksCount = await this.prisma.bookGenre.count({
      where: { genreId: id },
    });

    if (booksCount > 0) {
      throw new BadRequestException(
        `Cannot delete genre. This genre is assigned to ${booksCount} book(s). Please remove the genre from the books first.`,
      );
    }

    return this.prisma.genre.delete({
      where: { id },
    });
  }
}
