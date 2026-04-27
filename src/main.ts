import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RequestMethod } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use global prefix for all routes
  app.setGlobalPrefix('api', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  // Apply global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on PORT: ${process.env.PORT ?? 3000}`);
}
bootstrap().catch((err) => {
  console.error('Error starting the application:', err);
  process.exit(1);
});
