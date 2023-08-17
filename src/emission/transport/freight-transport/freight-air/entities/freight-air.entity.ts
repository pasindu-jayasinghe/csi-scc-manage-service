import { Country } from "src/country/entities/country.entity";
import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { AirPort } from "src/ports/air-port-list.entity";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'freight_air_activity_data'})
export class FreightAirActivityData extends EmissionBaseEntity {



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

    @Column({nullable: true,default: null})
    domOrInt: string

    @Column({nullable: true,default: null})
    cargoType: string;

    // @Column()
    // departureCountryOneWay: string;
    @ManyToOne((type) => Country, { eager: true, nullable: true })
    @JoinColumn()
    departureCountryOneWay: Country

    // @Column()
    // destinationCountryOneWay: string;
    @ManyToOne((type) => Country, { eager: true, nullable: true })
    @JoinColumn()
    destinationCountryOneWay: Country

    // @Column({default: null })
    // departureCountryTwoWay: string;
    @ManyToOne((type) => Country, { eager: true, nullable: true })
    @JoinColumn()
    departureCountryTwoWay: Country


    // @Column({default: null })
    // destinationCountryTwoWay: string;
    @ManyToOne((type) => Country, { eager: true, nullable: true })
    @JoinColumn()
    destinationCountryTwoWay: Country

    @ManyToOne((type) => AirPort, { eager: true, nullable: true })
    @JoinColumn()
    transist_oneWay_1: AirPort;

    @ManyToOne((type) => AirPort, { eager: true, nullable: true })
    @JoinColumn()
    transist_oneWay_2: AirPort;

    @ManyToOne((type) => AirPort, { eager: true, nullable: true })
    @JoinColumn()
    transist_oneWay_3: AirPort;

    @ManyToOne((type) => AirPort, { eager: true, nullable: true })
    @JoinColumn()
    transist_twoWay_1: AirPort;

    @ManyToOne((type) => AirPort, { eager: true, nullable: true })
    @JoinColumn()
    transist_twoWay_2: AirPort;

    @ManyToOne((type) => AirPort, { eager: true, nullable: true })
    @JoinColumn()
    transist_twoWay_3: AirPort;

    @Column()
    ownership: string;

    @Column()
    option: string;

    @ManyToOne((type) => AirPort, { eager: true, nullable: true })
    @JoinColumn()
    departureAirportOneWay: AirPort;

    @ManyToOne((type) => AirPort, { eager: true, nullable: true })
    @JoinColumn()
    destinationAirportOneWay: AirPort;

    @ManyToOne((type) => AirPort, { eager: true, nullable: true })
    @JoinColumn()
    departureAirportTwoWay: AirPort;

    @ManyToOne((type) => AirPort, { eager: true, nullable: true })
    @JoinColumn()
    destinationAirportTwoWay: AirPort;

    @Column({default:0})
    noOfTrips: number;

    @Column({default: null })
    distance_unit: string;

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

    @Column({ type: "double",default: 0 })
    totalDistanceTravelled: number;

    @Column({ type: "double",default: 0 })
    weight: number;

    @Column({ type: "double",default: 0 })
    upWeight: number;

    @Column({default: 0 })
    downWeight: number;

    @Column({default: null })
    upWeight_unit: string;

    @Column({default: null })
    downWeight_unit: string;

    @Column({ type: "double",default: 0 })
    cost: number;

    @Column({ type: "double",default: 0 })
    upCost: number;

    @Column({ type: "double",default: 0 })
    downCost: number;

    @Column({ type: "double",default: 0 })
    upCostPerKM: number;

    @Column({ type: "double",default: 0 })
    downCostPerKM: number;

    @Column({ type: "double", default: 0})
    emission: number;
  

    


}
