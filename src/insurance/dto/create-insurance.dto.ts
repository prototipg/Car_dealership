import { IsUUID, IsString, IsDateString, IsNumber } from 'class-validator';

export class CreateInsuranceDto {
    @IsUUID()
    sale_id: string;

    @IsString()
    provider: string;

    @IsString()
    policy_number: string;

    @IsDateString()
    start_date: string;

    @IsDateString()
    end_date: string;

    @IsNumber()
    premium_amount: number;
}
