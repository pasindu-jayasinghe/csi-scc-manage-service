import { Report } from "src/report/entities/report.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EmissionSource } from "./emission-source.entity";

@Entity()
export class EsExcludeReason extends BaseTrackingEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    reason: string;

    @ManyToOne((type) => EmissionSource, { eager: true })
    @JoinColumn()
    emissionSource: EmissionSource;

    @ManyToOne((type) => Report, { eager: false })
    @JoinColumn()
    report: Report;
}
