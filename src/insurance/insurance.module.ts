import { Module } from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { InsuranceController } from './insurance.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Insurance} from "./entities/insurance.entity";
import {Sales} from "../sales/entities/sale.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Insurance,Sales])],
  controllers: [InsuranceController],
  providers: [InsuranceService],
  exports: [InsuranceService]
})
export class InsuranceModule {}
