import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAuthorDto: CreateAuthorDto) {
    return this.prisma.author.create({
      data: {
        ...createAuthorDto,
        birthDate: createAuthorDto.birthDate
          ? new Date(createAuthorDto.birthDate)
          : undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.author.findMany({
      include: {
        books: true,
      },
    });
  }

  async findOne(id: string) {
    const author = await this.prisma.author.findUnique({
      where: { id },
      include: {
        books: true,
      },
    });

    if (!author) {
      throw new NotFoundException(`Author with ID ${id} not found`);
    }

    return author;
  }

  async update(id: string, updateAuthorDto: UpdateAuthorDto) {
    await this.findOne(id); // Ensure author exists

    return this.prisma.author.update({
      where: { id },
      data: {
        ...updateAuthorDto,
        birthDate: updateAuthorDto.birthDate
          ? new Date(updateAuthorDto.birthDate)
          : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure author exists

    return this.prisma.author.delete({
      where: { id },
    });
  }
}
