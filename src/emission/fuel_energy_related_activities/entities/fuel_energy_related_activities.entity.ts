import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { sourceName } from "src/emission/enum/sourcename.enum";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class FuelEnergyRelatedActivitiesActivityData extends EmissionBaseEntity{
    
    @PrimaryGeneratedColumn()
    id: number;


    @Column()
    fuelType: string;

    @Column()
    month: number;

    @Column()
    year: number;

    @Column()
    activityType: string;

    @Column()
    groupNo: string;

    @Column({ type: "double",default: 0})
    consumption: number;

    @Column({default: null})
    consumption_unit: string;
    
    @Column({type: "double",default: 0})
    emission: number;

    @Column({type: "double",default: 0,nullable:true})
    user_input_ef: number;

    
}

