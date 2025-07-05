import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Services} from "./entities/service.entity";
import {Cars} from "../cars/entities/car.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Services,Cars])],
  controllers: [ServicesController],
  providers: [ServicesService],
})
export class ServicesModule {}
