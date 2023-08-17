import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { NetZeroEmployeeCommutingEmissionSourceDataMethod } from "../dto/net-zero-employee-commuting-dto.dto";

@Entity()
export class NetZeroEmployeeCommutingActivityData extends EmissionBaseEntity{ 
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    month: number;

    @Column()
    year: number;

    @Column({
        type: "enum",
        enum: NetZeroEmployeeCommutingEmissionSourceDataMethod,
        default: null,
        nullable: true
    })
    method: NetZeroEmployeeCommutingEmissionSourceDataMethod;

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

    @Column({type: "double", nullable: true})
    commutingDaysPerYear: number;

    @Column({nullable: true})
    totalDistanceTravelled_unit: string;

    @Column({nullable: true})
    energy_source: string;
   
    @Column({type: "double", nullable: true})
    energy: number;

    @Column({nullable: true})
    energy_unit:string;



   

    @Column({type: "double", nullable: true})
    workingDayPerYear: number;

    @Column({type: "double", nullable: true})
    oneWayDistance: number;

    @Column({nullable: true})
    oneWayDistance_unit: string;

    @Column({type: "double", nullable: true})
    numberOfEmplyees: number;

    @Column({type: "double", nullable: true})
    presentageUsingVehcleType: number;




    @Column({type: "double",default: 0})
    emission: number;

    @Column({type: "double",default: 0})
    user_input_ef
    @Column()
    groupNo: string

}
