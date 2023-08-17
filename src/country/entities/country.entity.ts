import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Unit } from "src/unit/entities/unit.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";



@Entity()
export class Country extends BaseTrackingEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;

    @Column()
    code: string;

    @Column({nullable: true})
    codeThree: string;

    // @OneToMany((type) => Unit, (unit) => unit.country)
    // units: Unit[]

}
