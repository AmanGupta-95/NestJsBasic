import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BookService {
  // Track cache keys and delete them all
  private readonly cacheKeyPatterns = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Generate cache key based on filters
   */
  private getCacheKey(authorId?: string, genreId?: string): string {
    const parts = ['books'];
    if (authorId) parts.push(`author:${authorId}`);
    if (genreId) parts.push(`genre:${genreId}`);
    const key = parts.join(':');
    this.cacheKeyPatterns.add(key);
    return key;
  }

  private async clearBookCaches(): Promise<void> {
    await Promise.all(
      Array.from(this.cacheKeyPatterns).map((key) =>
        this.cacheManager.del(key),
      ),
    );
  }

  async create(createBookDto: CreateBookDto) {
    const [author, genres] = await Promise.all([
      this.prisma.author.findUnique({
        where: { id: createBookDto.authorId },
      }),
      this.prisma.genre.findMany({
        where: { id: { in: createBookDto.genreIds } },
      }),
    ]);

    // Validate author exists
    if (!author) {
      throw new NotFoundException(
        `Author with ID ${createBookDto.authorId} not found`,
      );
    }

    // Validate all genres exist
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

    // Invalidate all book list caches
    await this.clearBookCaches();

    return book;
  }

  async findAll(authorId?: string, genreId?: string) {
    // Generate cache key based on filters
    const cacheKey = this.getCacheKey(authorId, genreId);

    // Try to get from cache
    const cachedBooks = await this.cacheManager.get(cacheKey);
    if (cachedBooks) {
      return cachedBooks;
    }

    // If not in cache, fetch from database
    const where: {
      authorId?: string;
      genres?: { some: { genreId: string } };
    } = {};

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

    const books = await this.prisma.book.findMany({
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

    // Store in cache (TTL is set globally in CacheModule config)
    await this.cacheManager.set(cacheKey, books);

    return books;
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _count: authorCount, password: _password, ...authorData } = author;

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

    // Invalidate all book list caches
    await this.clearBookCaches();

    return updated;
  }

  async remove(id: string) {
    // Check if book exists (will throw if not found)
    await this.findOne(id);

    const deleted = await this.prisma.book.delete({
      where: { id },
    });

    // Invalidate all book list caches
    await this.clearBookCaches();

    return deleted;
  }
}
