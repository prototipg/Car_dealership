import { IsEnum, IsUUID, IsDateString, IsNumber } from 'class-validator';
import {PaymentMethod} from "../entities/payment.entity";

export class CreatePaymentDto {
    @IsUUID()
    sale_id: string;

    @IsNumber()
    amount: number;

    @IsDateString()
    payment_date: string;

    @IsEnum(PaymentMethod)
    method?: PaymentMethod;

    @IsUUID()
    user_id?: string;

    @IsUUID()
    insurance_id?: string;
}
