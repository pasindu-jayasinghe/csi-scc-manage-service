export class BusinessTravel {}

import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, Entity } from "typeorm";

@Entity()
export class BusinessTravelActivityData extends EmissionBaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    year: number;

    // @Column()
    // countryCode: string;

    @Column()
    transportMethod: string; // BT or EC

    // @Column({ nullable: true })
    // employeeName: string;

    @Column({nullable: true,default: null})
    domOrInt: string

    @Column({nullable: true})
    vehicleNo: string;

    @Column()
    method: string; //FB or DB

    @Column()
    ownership: string;

    @Column({default:0})
    noOfTrips: number;

    @Column({nullable: true, default: null})
    option: string;

    @Column({default:0})
    month: number;

    @Column({default: null, nullable: true})
    fuelType: string;
    
    // @Column({default: null, nullable: true})
    // hiredFuelType: string;

    // @Column({type: "double", nullable: true})
    // workingDays: number;

    // @Column({nullable: true})
    // directTransportMode: string;

    @Column({type: "double", nullable: true})
    totalDistanceTravelled: number;

    @Column({nullable: true})
    totalDistanceTravelled_unit: string;

    @Column({type: "double", nullable: true})
    btFuelConsumption: number;

    @Column({nullable: true})
    btFuelConsumption_unit: string;
    
    // @Column({type: "double", nullable: true})
    // petrolConsumption: number;

    // @Column({nullable: true})
    // petrolConsumption_unit: string;

    // @Column({type: "double", nullable: true})
    // dieselConsumption: number;

    // @Column({nullable: true})
    // dieselConsumption_unit: string;

    // @Column({nullable: true})
    // noEmissionMode: string;

    // @Column({nullable: true})
    // publicMode: string;

    // @Column({nullable: true})
    // privateMode: string;

    // @Column({nullable: true})
    // hiredMode: string;

    // @Column({type: "double", nullable: true})
    // noEmissionDistance: number;

    // @Column({nullable: true})
    // noEmissionDistance_unit: string;

    // @Column({type: "double", nullable: true})
    // publicDistance: number;

    // @Column({nullable: true})
    // publicDistance_unit: string;

    // @Column({type: "double", nullable: true})
    // privateDistance: number;

    // @Column({nullable: true})
    // privateDistance_unit: string;

    // @Column({type: "double", nullable: true})
    // hiredDistance: number;

    // @Column({nullable: true})
    // hiredDistance_unit: string;

    @Column({type: "double", nullable: true})
    fuelEconomy: number;

    @Column({nullable: true})
    fuelEconomy_unit: string;

    // @Column({type: "double", nullable: true})
    // hiredFuelEconomy: number;

    // @Column({nullable: true})
    // hiredFuelEconomy_unit: string;

    @Column({type: "double", nullable: true})
    cost: number;

    @Column({default: false})
    paidByCompany: boolean;


}
