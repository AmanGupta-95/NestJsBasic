import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    // Validate author exists
    const author = await this.prisma.author.findUnique({
      where: { id: createBookDto.authorId },
    });
    if (!author) {
      throw new NotFoundException(
        `Author with ID ${createBookDto.authorId} not found`,
      );
    }

    // Validate all genres exist
    const genres = await this.prisma.genre.findMany({
      where: { id: { in: createBookDto.genreIds } },
    });
    if (genres.length !== createBookDto.genreIds.length) {
      const foundIds = genres.map((g) => g.id);
      const missingIds = createBookDto.genreIds.filter(
        (id) => !foundIds.includes(id),
      );
      throw new NotFoundException(
        `Genre(s) not found: ${missingIds.join(', ')}`,
      );
    }

    // Create book with genres
    const { genreIds, ...bookData } = createBookDto;
    const book = await this.prisma.book.create({
      data: {
        ...bookData,
        publishedDate: createBookDto.publishedDate
          ? new Date(createBookDto.publishedDate)
          : undefined,
        genres: {
          create: genreIds.map((genreId) => ({
            genreId,
          })),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            nationality: true,
          },
        },
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    return book;
  }

  async findAll(authorId?: string, genreId?: string) {
    const where: any = {};

    // Apply filters with AND logic
    if (authorId) {
      where.authorId = authorId;
    }

    if (genreId) {
      where.genres = {
        some: {
          genreId: genreId,
        },
      };
    }

    return this.prisma.book.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        genres: {
          include: {
            genre: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        author: {
          include: {
            _count: {
              select: {
                books: true,
              },
            },
          },
        },
        genres: {
          include: {
            genre: {
              include: {
                _count: {
                  select: {
                    books: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    // Transform the response to include totalBooks count
    const { author, genres, ...bookData } = book;
    const { _count: authorCount, password: _, ...authorData } = author;

    return {
      ...bookData,
      author: {
        ...authorData,
        totalBooks: authorCount.books,
      },
      genres: genres.map(({ genre }) => {
        const { _count: genreCount, ...genreData } = genre;
        return {
          ...genreData,
          totalBooks: genreCount.books,
        };
      }),
    };
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    // Check if book exists
    await this.findOne(id);

    // Validate author if being updated
    if (updateBookDto.authorId) {
      const author = await this.prisma.author.findUnique({
        where: { id: updateBookDto.authorId },
      });
      if (!author) {
        throw new NotFoundException(
          `Author with ID ${updateBookDto.authorId} not found`,
        );
      }
    }

    // Validate genres if being updated
    if (updateBookDto.genreIds) {
      const genres = await this.prisma.genre.findMany({
        where: { id: { in: updateBookDto.genreIds } },
      });
      if (genres.length !== updateBookDto.genreIds.length) {
        const foundIds = genres.map((g) => g.id);
        const missingIds = updateBookDto.genreIds.filter(
          (id) => !foundIds.includes(id),
        );
        throw new NotFoundException(
          `Genre(s) not found: ${missingIds.join(', ')}`,
        );
      }
    }

    const { genreIds, ...bookData } = updateBookDto;

    // Update book and replace genres if provided
    const updated = await this.prisma.book.update({
      where: { id },
      data: {
        ...bookData,
        publishedDate: updateBookDto.publishedDate
          ? new Date(updateBookDto.publishedDate)
          : undefined,
        ...(genreIds && {
          genres: {
            deleteMany: {},
            create: genreIds.map((genreId) => ({
              genreId,
            })),
          },
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            nationality: true,
          },
        },
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(id: string) {
    // Check if book exists (will throw if not found)
    await this.findOne(id);

    return this.prisma.book.delete({
      where: { id },
    });
  }
}
