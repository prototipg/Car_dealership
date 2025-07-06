import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {swaggerConfig} from "./swagger/swagger.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
  );

  const config = swaggerConfig
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`Приложение запущено на: http://localhost:${port}/api`);
  console.log(`Swagger UI доступен на: http://localhost:${port}/api/docs`);
}
bootstrap();