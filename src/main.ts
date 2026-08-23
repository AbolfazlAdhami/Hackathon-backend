import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.enableCors({
    origin: process.env.FrONTEND_URL,
    creadentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: () => new BadRequestException('Validation failed'),
    }),
  );
  console.log(process.env.PORT);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
