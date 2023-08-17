import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EmissionSource } from "./emission-source.entity";


@Entity()
export class ProjectEmissionSource extends BaseTrackingEntity {

    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne((type) => EmissionSource, { eager: true })
    @JoinColumn()
    emissionSource: EmissionSource;

    @ManyToOne((type) => Project, { eager: true })
    @JoinColumn()
    project: Project;

    @Column({default:0})
    emission: number;

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
    otherN2OEmission: number

}
