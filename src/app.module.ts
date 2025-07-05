import {Logger, Module} from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { CarsModule } from './cars/cars.module';
import { TestDrivesModule } from './test-drives/test-drives.module';
import { ServicesModule } from './services/services.module';
import { SalesModule } from './sales/sales.module';
import { PaymentsModule } from './payments/payments.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { InsuranceModule } from './insurance/insurance.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule, ConfigService} from '@nestjs/config';
import {AuthModule} from "./auth/auth.module";
import {typeOrmConfig} from "./config/typeorm.config";


@Module({
  imports: [
      ConfigModule.forRoot({
          envFilePath: '.env',
          isGlobal: true,
      }),
      TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: typeOrmConfig,
          inject: [ConfigService],
      }),
      UsersModule,
      CarsModule,
      TestDrivesModule,
      ServicesModule,
      SalesModule,
      PaymentsModule,
      SuppliersModule,
      InsuranceModule,
      AuthModule
  ]
})
export class AppModule {
    private readonly logger = new Logger(AppModule.name);
    constructor() {
        this.logger.log('Инициализирован AppModule');
    }
}
