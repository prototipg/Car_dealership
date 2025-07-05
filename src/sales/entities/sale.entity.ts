import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, CreateDateColumn } from 'typeorm';
import {Cars} from "../../cars/entities/car.entity";
import {Users} from "../../users/entities/user.entity";
import {Insurance} from "../../insurance/entities/insurance.entity";

@Entity('sales')
export class Sales {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Cars, car => car.sales, { onDelete: 'CASCADE' })
    car: Cars;

    @ManyToOne(() => Users, user => user.purchases, { onDelete: 'CASCADE' })
    customer: Users;

    @ManyToOne(() => Users, user => user.sales, { onDelete: 'SET NULL', nullable: true })
    employee: Users;

    @CreateDateColumn()
    sale_date: Date;

    @Column('decimal')
    price_sold: number;

    @OneToOne(() => Insurance, insurance => insurance.sale, { nullable: true })
    insurance: Insurance;
}
