import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity()
export class PassengerAirPort extends BaseTrackingEntity{


    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    city_name: string;

    @Column()
    airport_code: string;

 
}
