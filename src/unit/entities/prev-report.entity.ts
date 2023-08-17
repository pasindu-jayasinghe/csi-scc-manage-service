import { Documents } from "src/document/entity/document.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UnitDetails } from "./unit-details.entity";

@Entity()
export class PrevReport  extends BaseTrackingEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    year: number;

    @ManyToOne((type) => UnitDetails, { eager: false })
    @JoinColumn()
    unitDetail: UnitDetails;

    @ManyToOne((type) => Documents, { eager: false })
    @JoinColumn()
    document: Documents;
}
