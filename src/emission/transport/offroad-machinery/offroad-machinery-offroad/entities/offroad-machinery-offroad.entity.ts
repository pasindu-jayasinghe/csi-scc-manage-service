import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Entity } from "typeorm";

@Entity()
export class OffroadMachineryOffroadActivityData extends EmissionBaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    year: number;

    // @Column()
    // countryCode: string

    @Column({nullable: true, default: null})
    domOrInt: string

    @Column()
    vehicleNo: string;

    @Column()
    vehicleModel: string;

    @Column()
    method: string;

    @Column()
    ownership: string;

    @Column({default:0})
    noOfTrips: number;

    @Column()
    option: string;

    @Column()
    month: number;
    
    @Column({default: null})
    fuelType: string;

    @Column({default: null})
    stroke: string; 

    @Column({type: "double", default: 0})
    totalDistanceTravelled: number;

    @Column()
    distance_unit: string;

    @Column({type: "double", nullable: true})
    fuelConsumption: number;

    @Column({nullable: true})
    fuelConsumption_unit: string;

    @Column({nullable: true,type: "double",})
    fuelEconomy: number;

    @Column({nullable: true})
    fuelEconomy_unit: string;

    @Column({default: false})
    paidByCompany: boolean;

    @Column({default: null})
    industry: string; 

    
}
