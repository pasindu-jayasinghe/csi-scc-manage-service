import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'freight_offroad_activity_data'})
export class FreightOffroadActivityData extends EmissionBaseEntity  {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    year: number;

    @Column({default: false})
    paidByCompany: boolean;

    @Column()
    vehicleModel: string

    @Column()
    vehicleNo: string;

    @Column()
    method: string;

    @Column()
    ownership: string;

    @Column({nullable: true})
    option: string;

    @Column({default:0})
    noOfTrips: number;

    @Column({nullable: true,default: null})
    domOrInt: string

    @Column({nullable: true,default: null})
    cargoType: string;

    @Column({default: null})
    totalDistanceTravelled: number;

    @Column({ type: "double",default: 0 })
    weight: number;

    @Column({default: null})
    fuelConsumption_unit: string;

    @Column({default: null})
    distance_unit: string;

    @Column({default: null})
    fuelType: string;  

    @Column({default: null})
    stroke: string; 

    @Column({type: "double", default: 0})
    fuelConsumption: number;

    @Column({default: null})
    industry: string; 

    
    // @Column({type: "double", default: 0})
    // emission: string;  

    @Column()
    month: number;

    

}
