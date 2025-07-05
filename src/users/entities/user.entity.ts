import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import {Sales} from "../../sales/entities/sale.entity";
import {Payments} from "../../payments/entities/payment.entity";
import {TestDrives} from "../../test-drives/entities/test-drive.entity";
import {Services} from "../../services/entities/service.entity";

export enum UserRole {
    CUSTOMER = 'customer',
    EMPLOYEE = 'employee',
    MANAGER = 'manager'
}

@Entity('users')
export class Users {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    phone: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole ,
        default: UserRole.CUSTOMER
    })
    role: UserRole;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => Sales, sale => sale.customer)
    purchases: Sales[];

    @OneToMany(() => Sales, sale => sale.employee)
    sales: Sales[];

    @OneToMany(() => Payments, payment => payment.user)
    payments: Payments[];

    @OneToMany(() => TestDrives, td => td.customer)
    testDrivesAsEmployee: TestDrives[];

    @OneToMany(() => Services, service => service.employee)
    services: Services[];

}
