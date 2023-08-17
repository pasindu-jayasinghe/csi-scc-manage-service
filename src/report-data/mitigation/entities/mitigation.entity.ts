
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Unit } from "src/unit/entities/unit.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Mitigation extends BaseTrackingEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    descryption: string;

    @ManyToOne((type) => Unit, { eager: true }) // do not remove eager: true
    @JoinColumn()
    unit: Unit;

    @ManyToOne((type) => Project, { eager: true })
    @JoinColumn()
    project: Project;
}