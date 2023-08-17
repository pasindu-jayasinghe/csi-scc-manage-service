import { EmissionSource } from "src/emission/emission-source/entities/emission-source.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, Entity } from "typeorm";

@Entity()
export class AirPortsDis extends BaseTrackingEntity{


    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code1: string;

    @Column()
    code2: string;

    @Column()
    distance: number;
    // @ManyToOne((type) => EmissionSource, { eager: false })
    // @JoinColumn()
    // source: EmissionSource;
}
