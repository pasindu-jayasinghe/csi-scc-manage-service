import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class ElectricityActivityData extends EmissionBaseEntity{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    meterNo: string;

    @Column()
    month: number;

    @Column()
    year: number;

    @Column({type: "double",default: 0})
    consumption: number;

    @Column()
    consumption_unit: string;

    @Column({type: "double",default: 0})
    emission: number;

    
}
