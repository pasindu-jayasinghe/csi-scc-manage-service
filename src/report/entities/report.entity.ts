import { Project } from "src/project/entities/project.entity";
import { NextStep } from "src/report-data/next-steps/entities/next-step.entity";
import { Recomendation } from "src/report-data/recomendation/entities/recomendation.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Unit } from "src/unit/entities/unit.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Uncertainty } from "./uncertainty.entity";



@Entity()
export class Report extends BaseTrackingEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    dissemination: string;

    @Column()
    dataGatheringMethods: string;

    @Column({default: 1})
    attempt: number;

    @Column()
    iSOStandard: string;

    @Column()
    previousYearISOStandard: string;

    @Column()
    proposedDate: Date //ok

    @Column()
    proposalNumber: string //ok

    @Column()
    lessOrGreater: string

    @Column({default: 0})
    indirectLimit: number

    @ManyToOne((type) => Unit, { eager: false, nullable: true })
    @JoinColumn()
    unit: Unit

    @ManyToOne((type) => Project, { eager: false, nullable: true })
    @JoinColumn()
    project: Project

    @ManyToMany(() => Recomendation, {eager: true})
    @JoinTable()
    recommendations: Recomendation[]

    @ManyToMany(() => NextStep, {eager: true})
    @JoinTable()
    nextSteps: NextStep[]

    @OneToMany((type) => Uncertainty, (uncertainty) => uncertainty.report)
    @JoinTable()
    uncertainty: Uncertainty[]

    @Column({nullable: true})
    standardAndApproach: string

    @Column({default: false, type: Boolean})
    allowClientGenerate: Boolean

    @Column({nullable: true})
    responsiblePerson: string

}
