import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Unit } from "src/unit/entities/unit.entity";
import {  Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProjectUnitEmissionSource } from "./project-unit-emission-source.entity";
import { Project } from "./project.entity";

@Entity()
export class ProjectUnit  extends BaseTrackingEntity{


    @PrimaryGeneratedColumn()
    id: number;

    @OneToMany((type) => ProjectUnitEmissionSource , (projectEmissionSource) => projectEmissionSource.projectUnit)
    projectUnitEmissionSources: ProjectUnitEmissionSource[]

    @ManyToOne((type) => Project, { eager: false })
    @JoinColumn()
    project: Project;

    @ManyToOne((type) => Unit, { eager: false })
    @JoinColumn()
    unit: Unit;

    @Column({default: false})
    isCreatingUnit: boolean
    
}
