import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {swaggerConfig} from "./swagger/swagger.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Настройка глобального префикса API
  app.setGlobalPrefix('api');

  // Настройка глобального пайпа валидации
  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
  );

  // Настройка Swagger
  const config = swaggerConfig
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Запуск сервера
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`Приложение запущено на: http://localhost:${port}/api`);
  console.log(`Swagger UI доступен на: http://localhost:${port}/api/docs`);
}
bootstrap();