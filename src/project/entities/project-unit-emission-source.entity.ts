import { EmissionSource } from "src/emission/emission-source/entities/emission-source.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { AssignedES } from "src/users/assignedES.entity";
import { Column, Double, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Clasification } from "../enum/clasification.enum";
import { Tier } from "../enum/tier.enum";
import { ProjectUnit } from "./project-unit.entity";


@Entity()
export class ProjectUnitEmissionSource extends BaseTrackingEntity {

    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne((type) => EmissionSource, { eager: true })
    @JoinColumn()
    emissionSource: EmissionSource;

    @ManyToOne((type) => ProjectUnit, {eager: true  })
    @JoinColumn()
    projectUnit: ProjectUnit;

    @Column({default:0})
    emission: number;

    @Column({default: Tier.ONE})
    tier: Tier

    @Column()
    clasification: Clasification;

    @OneToMany((type) => AssignedES , (projectEmissionSource) => projectEmissionSource.pues)
    assignedESList: AssignedES[];

    @Column({default: false})
    stationery: boolean

    @Column({default: false})
    mobile: boolean

    @Column({default: false})
    isComplete: boolean

    @Column({type: "double",default: 0})
    directEmission: number

    @Column({type: "double",default: 0})
    directCO2Emission: number

    @Column({type: "double",default: 0})
    directCH4Emission: number

    @Column({type: "double",default: 0})
    directN2OEmission: number

    @Column({type: "double",default: 0})
    indirectEmission: number

    @Column({type: "double",default: 0})
    indirectCO2Emission: number

    @Column({type: "double",default: 0})
    indirectCH4Emission: number

    @Column({type: "double",default: 0})
    indirectN2OEmission: number

    @Column({type: "double",default: 0})
    indirectEsGTOne: number

    @Column({type: "double",default: 0})
    otherEmission: number

    @Column({type: "double",default: 0})
    otherCO2Emission: number

    @Column({type: "double",default: 0})
    otherCH4Emission: number

    @Column({type: "double",default: 0})
    otherN2OEmission: number;

    @Column({nullable: true})
    scope: Scope
}

export enum Scope{
    ONE="ONE",
    TWO="TWO",
    THREE="THREE"
}