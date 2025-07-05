import { IsUUID, IsEnum, IsDateString } from 'class-validator';

export class CreateTestDriveDto {
    @IsUUID()
    car_id: string;

    @IsUUID()
    customer_id: string;

    @IsUUID()
    employee_id: string;

    @IsDateString()
    scheduled_at: string;

    @IsEnum(['scheduled', 'completed', 'cancelled'])
    status: string;
}
