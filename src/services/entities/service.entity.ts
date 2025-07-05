import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import {Cars} from "../../cars/entities/car.entity";
import {Users} from "../../users/entities/user.entity";

@Entity('services')
export class Services {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Cars, car => car.services,{ onDelete: 'CASCADE' ,nullable: false })
    car: Cars;

    @ManyToOne(() => Users, user => user.services,{ onDelete: 'SET NULL',nullable: false })
    employee: Users;

    @Column('text')
    description: string;

    @Column({ type: 'date' })
    service_date: Date;

    @Column('decimal')
    cost: number;
}
