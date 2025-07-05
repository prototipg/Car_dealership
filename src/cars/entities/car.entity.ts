import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import {Sales} from "../../sales/entities/sale.entity";
import {TestDrives} from "../../test-drives/entities/test-drive.entity";
import {Services} from "../../services/entities/service.entity";
import {Suppliers} from "../../suppliers/entities/supplier.entity";

export enum CarStatus {
    AVAILABLE = 'available',
    SOLD = 'sold',
    RESERVED = 'reserved',
}

@Entity('cars')
export class Cars {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    model: string;

    @Column()
    year: number;

    @Column({ unique: true })
    vin: string;

    @Column('decimal')
    price: number;

    @Column({
        type: 'enum',
        enum: CarStatus,
        default: CarStatus.AVAILABLE })
    status: CarStatus;

    @Column()
    mileage: number;

    @Column()
    color: string;

    @OneToMany(() => Sales, sale => sale.car)
    sales: Sales[];

    @OneToMany(() => TestDrives, td => td.car)
    testDrives: TestDrives[];

    @OneToMany(() => Services, service => service.car)
    services: Services[];

    @OneToMany(() => Suppliers, supplier => supplier.car)
    suppliers: Suppliers[];
}
