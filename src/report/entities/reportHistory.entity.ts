import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Unit } from "src/unit/entities/unit.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";



@Entity()
export class ReportHistory extends BaseTrackingEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    reportName: string;

    @Column()
    generateReportName: string;

    @Column()
    savedLocation: string;

    @Column()
    thumbnail: string;

    @ManyToOne((type) => Unit, { eager: false, nullable: true })
    @JoinColumn()
    unit: Unit

    @ManyToOne((type) => Project, { eager: false, nullable: true })
    @JoinColumn()
    project: Project


    @Column()
    versionName: string;
   
}
