import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { User } from "src/users/user.entity";
import { EmissionBaseEntity } from "src/emission/emission.base.entity"; 

@Entity()
export class MunicipalWaterActivityData extends EmissionBaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    year: number;

    // @Column()
    // countryCode: string

    @Column()
    consumption_unit:string;

    @Column({ type: "double",default: 0})
    consumption: number;

    @Column()
    meterNo : string;

    @Column({ default: null})
    category : string;

    @Column()
    month: number;

    @Column({ type: "double",default: 0})
    emission: number;


}
