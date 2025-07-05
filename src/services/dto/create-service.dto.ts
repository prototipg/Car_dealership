import {IsUUID, IsString, IsDateString, IsNumber, IsOptional} from 'class-validator';

export class CreateServiceDto {
    @IsUUID()
    car_id: string;

    @IsUUID()
    @IsOptional()
    employee_id?: string;

    @IsString()
    description: string;

    @IsDateString()
    @IsOptional()
    service_date: string;

    @IsNumber()
    cost: number;
}
