import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PassengerAirActivityData extends EmissionBaseEntity{
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
    ownership: string;

    @Column({default:0})
    noOfTrips: number;

    @Column()
    option: string;

    @Column()
    month: number;

    @Column()
    cabinClass: string;

    @Column()
    departurePort: string;

    @Column({nullable: true,default: null})
    transist1: string;

    @Column({nullable: true,default: null})
    transist2: string;

    @Column()
    destinationPort: string;

    @Column({nullable: true})
    noOfEmployees: number;

    @Column({default: false})
    paidByCompany: boolean;

    
}
