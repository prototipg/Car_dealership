import { Module } from '@nestjs/common';
import { TestDrivesService } from './test-drives.service';
import { TestDrivesController } from './test-drives.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {TestDrives} from "./entities/test-drive.entity";
import {Cars} from "../cars/entities/car.entity";
import {Users} from "../users/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([TestDrives , Cars , Users])],
  controllers: [TestDrivesController],
  providers: [TestDrivesService],
})
export class TestDrivesModule {}
