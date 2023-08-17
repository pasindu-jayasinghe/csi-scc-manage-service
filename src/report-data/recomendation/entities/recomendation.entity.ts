import { Report } from "src/report/entities/report.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Recomendation extends BaseTrackingEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    descryption: string;

    // @ManyToOne((type) => Report, { eager: false,  })
    // @JoinColumn()
    // report: Report;
}
