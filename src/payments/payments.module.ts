import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Payments} from "./entities/payment.entity";
import {Sales} from "../sales/entities/sale.entity";
import {Users} from "../users/entities/user.entity";
import {Insurance} from "../insurance/entities/insurance.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Payments,Sales,Users,Insurance])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
