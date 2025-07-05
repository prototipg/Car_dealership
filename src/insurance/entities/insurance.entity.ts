import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany} from 'typeorm';
import {Sales} from "../../sales/entities/sale.entity";
import {Payments} from "../../payments/entities/payment.entity";


@Entity('insurance')
export class Insurance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Sales, sale => sale.insurance, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    sale: Sales;

    @OneToMany(() => Payments, payment => payment.insurance, { nullable: true })
    payments: Payments[];

    @Column()
    provider: string;

    @Column()
    policy_number: string;

    @Column({ type: 'date' })
    start_date: Date;

    @Column({ type: 'date' })
    end_date: Date;

    @Column('decimal')
    premium_amount: number;
}
