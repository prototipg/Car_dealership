import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Sales} from "./entities/sale.entity";
import {Cars} from "../cars/entities/car.entity";
import {Users} from "../users/entities/user.entity";
import {Insurance} from "../insurance/entities/insurance.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Sales,Cars,Users,Insurance])],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService]
})
export class SalesModule {}
