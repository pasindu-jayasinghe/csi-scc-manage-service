import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Unit } from "./unit.entity";


@Entity()
export class Level extends BaseTrackingEntity{
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
    
    @Column()
    code: string;

    // @OneToMany((type) => Unit, (unit) => unit.level)
    // units: Unit[]
}
