import { EmissionSource } from "src/emission/emission-source/entities/emission-source.entity";
import { Project } from "src/project/entities/project.entity";
import { NextStep } from "src/report-data/next-steps/entities/next-step.entity";
import { Recomendation } from "src/report-data/recomendation/entities/recomendation.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Unit } from "src/unit/entities/unit.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Report } from "./report.entity";



@Entity()
export class Uncertainty extends BaseTrackingEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    descryption: string;

    @Column({nullable: true})
    ownership: string;

    @ManyToOne((type) => EmissionSource, { eager: true })
    @JoinColumn()
    emissionSource: EmissionSource;

    @ManyToOne((type) => Report, { eager: false, nullable: true })
    @JoinColumn()
    report: Report;
}
