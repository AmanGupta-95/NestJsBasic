import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Author } from '@prisma/client';
import * as bcrypt from 'bcrypt';

type AuthorWithoutPassword = Omit<Author, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateAuthor(
    email: string,
    password: string,
  ): Promise<AuthorWithoutPassword | null> {
    const author = await this.prisma.author.findUnique({
      where: { email },
    });

    if (author && (await bcrypt.compare(password, author.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...result } = author;
      return result;
    }
    return null;
  }

  async signIn(author: AuthorWithoutPassword) {
    const payload = { email: author.email, sub: author.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
      author: {
        id: author.id,
        email: author.email,
        name: author.name,
      },
    };
  }
}
