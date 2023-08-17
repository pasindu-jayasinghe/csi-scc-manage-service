import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UnitDetails } from "./unit-details.entity";

@Entity()
export class NumEmployee extends BaseTrackingEntity {
 

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    year: string;

    @Column({default: 0, nullable: true})
    totalEmployees: number;

    @Column({default: 0, nullable: true})
    totalEmployeesPaid: number;

    @Column({type: 'bigint', default: 0, nullable: true})
    totalRevenue: number;

    @Column({nullable: true})
    totalRevenue_unit: string;

    @Column({default: 0, nullable: true})
    target: number;

    @ManyToOne((type) => UnitDetails, { eager: false })
    @JoinColumn()
    unitDetail: UnitDetails;
  dto: Promise<any>;

}
