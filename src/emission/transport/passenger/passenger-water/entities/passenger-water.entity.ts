import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class PassengerWaterActivityData extends EmissionBaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    year: number;

    // @Column()
    // countryCode: string

    @Column({nullable: true,default: null})
    domOrInt: string

    @Column()
    vehicleNo: string;

    @Column()
    model: string;

    @Column()
    method: string;

    @Column()
    ownership: string;

    @Column({default:0})
    noOfTrips: number;

    @Column({nullable: true, default: null})
    option: string;

    @Column()
    month: number;
    
    @Column({default: null})
    fuelType: string;

    @Column({type: "double", default: 0})
    totalDistanceTravelled: number;

    @Column({default: null})
    totalDistanceTravelled_unit: string;

    @Column({nullable: true, type:"double"})
    fuelConsumption: number;

    @Column({nullable: true})
    fuelConsumption_unit: string;

    @Column({nullable: true, type: "double"})
    fuelEconomy: number;

    @Column({nullable: true})
    fuelEconomy_unit: string;

    @Column({default: false})
    paidByCompany: boolean;
    
}