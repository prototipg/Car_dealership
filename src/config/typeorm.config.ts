import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Users } from '../users/entities/user.entity';
import { Cars } from '../cars/entities/car.entity';
import { Sales } from '../sales/entities/sale.entity';
import { TestDrives } from '../test-drives/entities/test-drive.entity';
import { Payments } from '../payments/entities/payment.entity';
import { Services } from '../services/entities/service.entity';
import { Suppliers } from '../suppliers/entities/supplier.entity';
import { Insurance } from '../insurance/entities/insurance.entity';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get<string>('DB_HOST' ),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    entities: [Users, Cars, Sales, TestDrives, Payments, Services, Suppliers, Insurance],
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
    logging: configService.get<boolean>('DB_LOGGING'),
});