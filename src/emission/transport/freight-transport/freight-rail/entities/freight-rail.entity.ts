import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { RailPort } from "src/ports/rail-station.entity";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'freight_rail_activity_data'})
export class FreightRailActivityData extends EmissionBaseEntity  {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    year: number;

    // @Column({default: null})
    // countryCode: string

    @Column({default: false})
    paidByCompany: boolean;

    @Column()
    vehicleNo: string;

    @Column()
    method: string;
    
    @Column({default: "ONE_WAY"})
    option: string;

    @Column({nullable: true,default: null})
    domOrInt: string

    @Column({nullable: true,default: null})
    cargoType: string;

    // @Column()
    @ManyToOne((type) => RailPort, {nullable: true, eager: true })
    @JoinColumn()
    departureStationUp: RailPort;

    // @Column()
    @ManyToOne((type) => RailPort, {nullable: true, eager: true })
    @JoinColumn()
    destinationStationUp: RailPort;
    
    // @Column()
    @ManyToOne((type) => RailPort, {nullable: true, eager: true })
    @JoinColumn()
    departureStationDown: RailPort;

    // @Column()
    @ManyToOne((type) => RailPort, {nullable: true, eager: true })
    @JoinColumn()
    destinationStationDown: RailPort;

    @Column()
    ownership: string;

    @Column()
    noOfTrips: number;

    @Column()
    month: number;

    @Column({default: null})
    fuelConsumption_unit: string;

    @Column({default: null})
    distance_unit: string;

    @Column({type: "double",default: 0})
    weight: number;

    @Column({default: null})
    fuelType: string;  

    @Column({type: "double", default: 0})
    fuelConsumption: number;

    @Column({type: "double", default: 0})
    distanceUp: number;

    @Column({type: "double", default: 0})
    distanceDown: number;

    @Column({type: "double", default: 0})
    weightUp: number;

    @Column({type: "double", default: 0})
    weightDown: number;

    @Column({default: null})
    distanceUp_unit: string;

    @Column({default: null})
    distanceDown_unit: string;

    @Column({default: null})
    weightUp_unit: string;

    @Column({default: null})
    weightDown_unit: string;

    @Column({ type: "double",default: 0 })
    upCostPerKM: number;

    @Column({ type: "double",default: 0 })
    downCostPerKM: number;

    @Column({ type: "double",default: 0 })
    upCost: number;

    @Column({ type: "double",default: 0 })
    downCost: number;

    @Column({default: null})
    activity: string;

    @Column({default: null})
    type: string;

    

}
