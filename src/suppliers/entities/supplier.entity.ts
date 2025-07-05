import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import {Cars} from "../../cars/entities/car.entity";

@Entity('suppliers')
export class Suppliers {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Cars, car => car.suppliers,{ onDelete: 'CASCADE', nullable: false })
    car: Cars;

    @Column({ type: 'date' })
    received_date: Date;

    @Column()
    source: string;

    @Column('decimal')
    purchase_price: number;
}
