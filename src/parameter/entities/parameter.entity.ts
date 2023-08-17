import { EmissionSource } from "src/emission/emission-source/entities/emission-source.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, Entity } from "typeorm";

@Entity()
export class Parameter extends BaseTrackingEntity{

    // Need to initialize parameter table

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    code: string;

    @Column({default: false})
    isConstant: boolean;

    @ManyToOne((type) => EmissionSource, { eager: false })
    @JoinColumn()
    source: EmissionSource;
}
