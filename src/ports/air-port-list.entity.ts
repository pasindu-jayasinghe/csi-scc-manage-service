import { Country } from "src/country/entities/country.entity";
import { EmissionSource } from "src/emission/emission-source/entities/emission-source.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, Entity } from "typeorm";

@Entity()
export class AirPort extends BaseTrackingEntity{


    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    code: string;

    @ManyToOne((type) => Country, { eager: false })
    @JoinColumn()
    country: Country;

 
}
