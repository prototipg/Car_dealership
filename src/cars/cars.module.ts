import { Module } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Cars} from "./entities/car.entity";
import {Sales} from "../sales/entities/sale.entity";
import {TestDrives} from "../test-drives/entities/test-drive.entity";
import {Services} from "../services/entities/service.entity";
import {Suppliers} from "../suppliers/entities/supplier.entity";
import {Users} from "../users/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Cars,Sales,TestDrives,Services,Suppliers,Users])],
  controllers: [CarsController],
  providers: [CarsService],
  exports: [CarsService]
})
export class CarsModule {}
