import {IsEnum, IsNumber, IsOptional, IsString} from 'class-validator';
import {CarStatus} from "../entities/car.entity";

export class CreateCarDto {
    @IsString()
    model: string;

    @IsNumber()
    year: number;

    @IsString()
    vin: string;

    @IsNumber()
    price: number;

    @IsEnum(CarStatus)
    @IsOptional()
    status: CarStatus;

    @IsNumber()
    mileage: number;

    @IsString()
    color: string;
}
