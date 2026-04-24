import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAuthorDto: CreateAuthorDto) {
    const hashedPassword = await bcrypt.hash(createAuthorDto.password, 10);

    const author = await this.prisma.author.create({
      data: {
        ...createAuthorDto,
        password: hashedPassword,
        birthDate: createAuthorDto.birthDate
          ? new Date(createAuthorDto.birthDate)
          : undefined,
      },
    });

    // Remove password from response
    const { password: _, ...result } = author;
    return result;
  }

  async findAll() {
    const authors = await this.prisma.author.findMany({
      include: {
        books: true,
      },
    });

    // Remove password from each author
    return authors.map(({ password: _, ...author }) => author);
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

    // Remove password from response
    const { password: _, ...result } = author;
    return result;
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
