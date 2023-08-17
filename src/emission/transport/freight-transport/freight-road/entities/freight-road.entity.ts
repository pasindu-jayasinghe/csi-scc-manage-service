import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'freight_road_activity_data'})
export class FreightRoadActivityData extends EmissionBaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    year: number;

    // @Column()
    // countryCode: string

    @Column({default: false})
    paidByCompany: boolean;

    @Column()
    vehicleNo: string;

    @Column()
    method: string;

    // @Column()
    // departureCountry: string;

    // @Column()
    // destinationCountry: string;

    // @Column()
    // transient: string;

    @Column()
    ownership: string;

    // @Column()
    // freightType: string;

    @Column({nullable: true,default: false})
    isShared: boolean;

    @Column({ type: "double", default: 100 })
    share: number

    @Column()
    cargoType: string;

    @Column({nullable: true})
    option: string;

    @Column({nullable: true,default: null})
    domOrInt: string

    // @Column({ type: "double",default: 0 })
    // weight: number;

    @Column({ type: "double",default: 0 })
    upWeight: number;

    @Column({ type: "double",default: 0 })
    downWeight: number;

    @Column({default: null })
    upWeight_unit: string;

    @Column({default: null })
    downWeight_unit: string;

    // @Column({ type: "double",default: 0 })
    // cost: number;

    @Column({ type: "double",default: 0 })
    upCost: number;

    @Column({ type: "double",default: 0 })
    downCost: number;

    @Column({ type: "double",default: 0 })
    upCostPerKM: number;

    @Column({ type: "double",default: 0 })
    downCostPerKM: number;

    @Column({default:0})
    noOfTrips: number;

    @Column()
    month: number;

    @Column({default: null })
    upDistance_unit: string;

    @Column({default: null })
    downDistance_unit: string;

    @Column({ type: "double",default: 0 })
    upDistance: number;

    @Column({ type: "double",default: 0 })
    downDistance: number;

    @Column({default: null})
    fuelConsumption_unit: string;

    @Column({default: null})
    fuelType: string;  

    @Column({type: "double", default: 0})
    fuelConsumption: number;
    
    @Column({type: "double", default: 0})
    fuelEconomy: number;

    @Column({default: null})
    fuelEconomy_unit: string;

    // @Column({type: "double", default: 0})
    // emission: number;

    

}
