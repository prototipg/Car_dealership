import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import {Cars} from "../../cars/entities/car.entity";
import {Users} from "../../users/entities/user.entity";

export enum TestDriveStatus {
    SCHEDULED = 'scheduled',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

@Entity('test_drives')
export class TestDrives {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Cars, car => car.testDrives)
    car: Cars;

    @ManyToOne(() => Users, user => user.testDrivesAsEmployee)
    customer: Users;


    @ManyToOne(() => Users, (user) => user.testDrivesAsEmployee, { onDelete: 'SET NULL', nullable: true})
    employee: Users;

    @Column({ type: 'timestamp' })
    scheduled_at: Date;

    @Column({
        type: 'enum',
        enum: TestDriveStatus,
        default: TestDriveStatus.SCHEDULED,
    })
    status: string;
}
