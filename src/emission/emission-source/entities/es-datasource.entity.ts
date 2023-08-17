import { Report } from "src/report/entities/report.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { UnitDetails } from "src/unit/entities/unit-details.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EmissionCategory } from "./emission-category.entity";
import { EmissionSource } from "./emission-source.entity";

@Entity()
export class EsDatasource extends BaseTrackingEntity{
   
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    hiredDataSource: string;

    @Column()
    rentedDataSource: string;

    @Column()
    ownDataSource: string;

    @Column()
    noneDataSource: string;

    @ManyToOne((type) => EmissionSource, { eager: true })
    @JoinColumn()
    emissionSource: EmissionSource;

    @ManyToOne((type) => Report, { eager: false })
    @JoinColumn()
    report: Report;

    @ManyToOne((type) => EmissionCategory, { eager: true, nullable: true })
    @JoinColumn()
    hiredCategory: EmissionCategory;

    @ManyToOne((type) => EmissionCategory, { eager: true, nullable: true })
    @JoinColumn()
    rentedCategory: EmissionCategory;

    @ManyToOne((type) => EmissionCategory, { eager: true, nullable: true })
    @JoinColumn()
    ownCategory: EmissionCategory;

    @ManyToOne((type) => EmissionCategory, { eager: true, nullable: true })
    @JoinColumn()
    noneCategory: EmissionCategory;
    
}
