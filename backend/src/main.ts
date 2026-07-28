import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors([
    'http://localhost:4200',
    'https://vocabulary-angular.vercel.app'
  ]);

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

void bootstrap();
