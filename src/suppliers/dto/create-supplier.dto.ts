import {IsUUID, IsString, IsDateString, IsNumber, IsOptional} from 'class-validator';

export class CreateSupplierDto {
    @IsUUID()
    car_id: string;

    @IsDateString()
    @IsOptional()
    received_date: string;

    @IsString()
    source: string;

    @IsNumber()
    purchase_price: number;
}
