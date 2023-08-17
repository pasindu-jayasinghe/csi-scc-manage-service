import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Double } from "typeorm-next";


@Entity({name:'fire_extinguisher_activity_data'})
export class FireExtinguisherActivityData extends EmissionBaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fireExtinguisherType: string;

    @Column({nullable:true,default: null})
    suppressionType: string; 
 
    @Column({nullable:true,default: 0})
    noOfTanks: number;

    @Column({ type: "double",default: 0 })
    weightPerTank: number;

    @Column()
    weightPerTank_unit: string;

    @Column()
    month: number;

    @Column()
    year: number;

    @Column({ type: "double" ,default: 0})
    emission:number;

    

}
