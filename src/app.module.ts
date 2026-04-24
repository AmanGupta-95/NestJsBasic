import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthorModule } from './modules/author/author.module';
import { GenreModule } from './modules/genre/genre.module';

@Module({
  imports: [PrismaModule, AuthorModule, GenreModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
