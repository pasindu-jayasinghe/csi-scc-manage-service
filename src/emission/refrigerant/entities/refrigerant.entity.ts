import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RefrigerantActivityData extends EmissionBaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    year: number;

    // @Column()
    // country: string

    @Column({ type: "double",default: 0})
    w_RG : number; //amount refill

    @Column()
    w_RG_unit : string;

    @Column()
    gWP_RG: string; //refrigerant type

    @Column({ type: "double",default: 0})
    e_RL: number; //emission

    // @Column()
    // consumption_unit: string;

    @Column()
    month: number;

    //netZero-----------
    @Column({nullable:true})
    activityType : string;

    
    @Column({ type: "double",default: 0})
    assembly_Lf: number;


    @Column({ type: "double",default: 0})
    annual_lR: number;

    @Column({ type: "double",default: 0})
    time_R: number;

    
    @Column({ type: "double",default: 0})
    p_capacity: number;

    @Column({ type: "double",default: 0})
    p_r_recover: number;
}
