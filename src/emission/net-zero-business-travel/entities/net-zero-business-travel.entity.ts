import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { NetZeroBusinessTravelEmissionSourceDataMethod } from "../dto/net-zero-business-travel-dto.dto";

@Entity()
export class NetZeroBusinessTravelActivityData extends EmissionBaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    month: number;

    @Column()
    year: number;

    @Column({
        type: "enum",
        enum: NetZeroBusinessTravelEmissionSourceDataMethod,
        default: null,
        nullable: true
    })
    method: NetZeroBusinessTravelEmissionSourceDataMethod;

    @Column({default: null, nullable: true})
    type: string;

   
    @Column({default: null, nullable: true})
    fuel_type: string;

    @Column({type: "double", nullable: true})
    fuel_quntity:number;

    @Column({default: null, nullable: true})
    fuel_quntity_unit: string;


    @Column({default: null, nullable: true})
    grid_type: string;

    @Column({type: "double", nullable: true})
    grid_quntity:number;

    @Column({default: null, nullable: true})
    grid_quntity_unit: string;

    @Column({default: null, nullable: true})
    refrigerant_type: string;
   
    @Column({type: "double", nullable: true})
    refrigerant_quntity:number;

    
    @Column({default: null, nullable: true})
    refrigerant_quntity_unit: string;

    @Column({default: null, nullable: true})
    vehicleType: string;
    @Column({type: "double", nullable: true})
    totalDistanceTravelled: number;

    @Column({nullable: true})
    totalDistanceTravelled_unit: string;

    @Column({default: null, nullable: true})
    countryCode: string;

    @Column({type: "double", nullable: true})
    totalNumberHotelNight: number;

    
    @Column({default: null, nullable: true})
    travel_type:string;

    @Column({type: "double", nullable: true})
    totalAmountOnTravel: number;

    @Column({default: null, nullable: true})
    totalAmountOnTravel_unit: string;

    @Column({type: "double",default: 0})
    emission: number;

    @Column({type: "double",default: 0})
    user_input_ef
    @Column()
    groupNo: string
}
