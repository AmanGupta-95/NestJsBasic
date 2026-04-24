import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateAuthor(email: string, password: string): Promise<any> {
    const author = await this.prisma.author.findUnique({
      where: { email },
    });

    if (author && (await bcrypt.compare(password, author.password))) {
      const { password: _, ...result } = author;
      return result;
    }
    return null;
  }

  async signIn(author: any) {
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
