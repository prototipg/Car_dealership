import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import {Sales} from "../../sales/entities/sale.entity";
import {Users} from "../../users/entities/user.entity";
import {Insurance} from "../../insurance/entities/insurance.entity";

export enum PaymentMethod {
    CASH = 'cash',
    CARD = 'card',
    LOAN = 'loan',
}

@Entity('payments')
export class Payments {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Sales, sale => sale.id,{onDelete: 'CASCADE'})
    sale: Sales;

    @Column('decimal')
    amount: number;

    @Column({ type: 'date' })
    payment_date: Date;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
        default: PaymentMethod.CASH,
    })
    method: PaymentMethod;

    @ManyToOne(() => Users, user => user.payments, { onDelete: 'CASCADE' })
    user: Users;

    @ManyToOne(() => Insurance, insurance => insurance.id, { nullable: true, onDelete: 'SET NULL' })
    insurance: Insurance;
}
