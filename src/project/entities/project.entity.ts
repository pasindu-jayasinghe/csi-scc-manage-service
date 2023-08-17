import { ProjectEmissionSource } from "src/emission/emission-source/entities/project-emission-source.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Unit } from "src/unit/entities/unit.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { projectStatus } from "../enum/project-status.enum";
import { Methodology } from "./methodology.entity";
import { ProjectType } from "./project-type.entity";
import { ProjectUnit } from "./project-unit.entity";

@Entity()
export class Project  extends BaseTrackingEntity{


    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    name: string;

    @Column({nullable: true})
    year: string;

    @OneToMany((type) => ProjectEmissionSource, (projectEmissionSource) => projectEmissionSource.project)
    projectEmissionSources: ProjectEmissionSource[]

    @OneToMany((type) => ProjectUnit, (projectUnit) => projectUnit.project)
    projectUnits: ProjectUnit[]

    @ManyToOne((type) => ProjectType, { eager: true })
    @JoinColumn()
    projectType: ProjectType;

    @ManyToOne((type) => Methodology, { eager: true })
    @JoinColumn()
    methodology: Methodology;

    @Column()
    projectStatus: projectStatus;

    @ManyToOne((type) => User, { eager: false, nullable: true })
    @JoinColumn()
    verifier: User;

    @ManyToOne((type) => User, { eager: false })
    @JoinColumn()
    enteredBy: User;

    @ManyToOne((type) => User, { eager: false })
    @JoinColumn()
    responsiblePerson: User;

    @Column({nullable: true})
    organizationalBoundary: string

    @Column({nullable: true})
    controlApproach: string

    @Column({default:0})
    emission: number;

    @Column({default:false})
    isFinancialYear: boolean;

    @Column({nullable: true})
    fyFrom: Date;

    @Column({nullable: true})
    fyTo: Date

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

    @ManyToOne((type) => Unit, { eager: false, nullable: true })
    @JoinColumn()
    ownerUnit: Unit

    @Column({default:null})
    comment: string

    @Column({default:null})
    paymentReff: string

    
}
