import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
    .setTitle('Car Dealership API')
    .setDescription('API для управления автосалоном, включая пользователей, автомобили, продажи, тест-драйвы, платежи, сервисы, поставки и страховки')
    .setVersion('1.0')
    .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT-auth',
    )
    .addTag('auth', 'Эндпоинты для аутентификации и регистрации')
    .addTag('users', 'Управление пользователями')
    .addTag('cars', 'Управление автомобилями')
    .addTag('sales', 'Управление продажами')
    .addTag('test-drives', 'Управление тест-драйвами')
    .addTag('payments', 'Управление платежами')
    .addTag('services', 'Управление сервисным обслуживанием')
    .addTag('suppliers', 'Управление поставками')
    .addTag('insurance', 'Управление страховками')
    .build();