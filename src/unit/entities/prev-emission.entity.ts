import { EmissionSource } from "src/emission/emission-source/entities/emission-source.entity";
import { ProjectType } from "src/project/entities/project-type.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UnitDetails } from "./unit-details.entity";
import { Unit } from "./unit.entity";

@Entity()
export class PrevEmission  extends BaseTrackingEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    year: number;

    @ManyToOne((type) => Unit, { eager: false })
    @JoinColumn()
    unit: Unit;

    @ManyToOne((type) => ProjectType, { eager: true })
    @JoinColumn()
    projectType: ProjectType;

    @ManyToOne((type) => EmissionSource, { eager: true })
    @JoinColumn()
    emissionSource: EmissionSource;

    @Column({nullable: true})
    ownership: string;
  
    @Column({ type: "double",default: 0 })
    e_sc:number;
}
