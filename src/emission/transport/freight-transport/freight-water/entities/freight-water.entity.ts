import { Country } from "src/country/entities/country.entity";
import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";
import { SeaPort } from "src/ports/sea-port-list.entity";
import { Project } from "src/project/entities/project.entity";
import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { User } from "src/users/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'freight_water_activity_data'})
export class FreightWaterActivityData extends EmissionBaseEntity {

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

    @Column({nullable: true,default: null})
    domOrInt: string

    @Column({nullable: true,default: null})
    cargoType: string;

    // @Column()
    @ManyToOne((type) => Country, { eager: true, nullable: true })
    @JoinColumn()
    departureCountryOneWay: Country;

    // @Column()
    @ManyToOne((type) => Country, { eager: true, nullable: true })
    @JoinColumn()
    destinationCountryOneWay: Country;

    // @Column({default: null })
    @ManyToOne((type) => Country, { eager: true, nullable: true })
    @JoinColumn()
    departureCountryTwoWay: Country;

    // @Column({default: null })
    @ManyToOne((type) => Country, { eager: true, nullable: true })
    @JoinColumn()
    destinationCountryTwoWay: Country;

    // @Column({default: null})
    @ManyToOne((type) => SeaPort, { eager: true, nullable: true })
    @JoinColumn()
    transist_oneWay_1: SeaPort;

    // @Column({default: null})
    @ManyToOne((type) => SeaPort, { eager: true, nullable: true })
    @JoinColumn()
    transist_oneWay_2: SeaPort;

    // @Column({default: null})
    @ManyToOne((type) => SeaPort, { eager: true, nullable: true })
    @JoinColumn()
    transist_oneWay_3: SeaPort;

    // @Column({default: null})
    @ManyToOne((type) => SeaPort, { eager: true, nullable: true })
    @JoinColumn()
    transist_twoWay_1: SeaPort;

    // @Column({default: null})
    @ManyToOne((type) => SeaPort, { eager: true, nullable: true })
    @JoinColumn()
    transist_twoWay_2: SeaPort;

    // @Column({default: null})
    @ManyToOne((type) => SeaPort, { eager: true, nullable: true })
    @JoinColumn()
    transist_twoWay_3: SeaPort;

    @Column()
    ownership: string;

    @Column({default: "ONE_WAY"})
    option: string;

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

    // @Column()
    // freightType: string;

    // @Column({default: null })
    @ManyToOne((type) => SeaPort, { eager: true, nullable: true })
    @JoinColumn()
    departurePortOneWay: SeaPort;

    // @Column({default: null })
    @ManyToOne((type) => SeaPort, { eager: true, nullable: true })
    @JoinColumn()
    destinationPortOneWay: SeaPort;

    // @Column({default: null })
    @ManyToOne((type) => SeaPort, { eager: true, nullable: true })
    @JoinColumn()
    departurePortTwoWay: SeaPort;

    // @Column({default: null })
    @ManyToOne((type) => SeaPort, { eager: true, nullable: true })
    @JoinColumn()
    destinationPortTwoWay: SeaPort;

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

    @Column({ type: "double",default: 0 })
    upCostPerKM: number;

    @Column({ type: "double",default: 0 })
    downCostPerKM: number;

    @Column({default: null })
    activity: string;

    @Column({default: null })
    size: string;

    @Column({default: null })
    type: string;

    @Column({default: null})
    vezel: string;

    // @Column({default: 0})
    // totalDistanceTravelled: number;

    @Column({default: null})
    fuel_unit: string;

    @Column({default: null})
    distance_unit: string;

    @Column({default: null})
    fuelType: string;  

    @Column({type: "double", default: 0})
    fuelConsumption: number;

    @Column({type: "double", default: 0})
    emission: number;

    // @ManyToOne((type) => Project, { eager: true })
    // @JoinColumn()
    // project: Project;

    // @ManyToOne((type) => User, { eager: false, nullable: true})
    // @JoinColumn()
    // user: User;

    

}
