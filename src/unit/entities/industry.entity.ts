import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TypeSM } from "../enum/type-s-m.enum";
import { Unit } from "./unit.entity";


@Entity()
export class Industry extends BaseTrackingEntity{
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;
    
    @Column()
    code: string;

    @OneToMany((type) => Unit, (unit) => unit.industry)
    units: Unit[]

    @Column({default: null})
    type: TypeSM;

}
