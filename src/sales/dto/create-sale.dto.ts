import {IsUUID, IsNumber, IsString, IsOptional} from 'class-validator';

export class CreateSaleDto {
    @IsUUID()
    car_id: string;

    @IsUUID()
    customer_id: string;

    @IsUUID()
    @IsOptional()
    employee_id?: string;

    @IsNumber()
    price_sold: number;

    @IsString()
    @IsOptional()
    insurance_id?: string;
}
