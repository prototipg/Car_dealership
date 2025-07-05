import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Suppliers} from "./entities/supplier.entity";
import {Cars} from "../cars/entities/car.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Suppliers,Cars])],
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SuppliersModule {}
