import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { DownstreamLeasedAssetsEmissionSourceDataMethod } from "../dto/downstream-leased-assets-dto.dto";



@Entity()
export class DownstreamLeasedAssetsActivityData extends EmissionBaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    month: number;

    @Column()
    year: number;

    @Column({
        type: "enum",
        enum: DownstreamLeasedAssetsEmissionSourceDataMethod,
        default: null,
        nullable: true
    })
    method: DownstreamLeasedAssetsEmissionSourceDataMethod;

    @Column({default: null, nullable: true})
    type: string;

   
    @Column({default: null, nullable: true})
    fuel_type: string;

    @Column({type: "double", nullable: true})
    fuel_quntity:number;

    @Column({default: null, nullable: true})
    fuel_quntity_unit: string;


    @Column({default: null, nullable: true})
    refrigerant_type: string;
   
    @Column({type: "double", nullable: true})
    refrigerant_quntity:number;

    
    @Column({default: null, nullable: true})
    refrigerant_quntity_unit: string;


    @Column({type: "double", nullable: true})
    process_emission:number


    @Column({default: null, nullable: true})
    process_emission_unit:string

    @Column({default: null, nullable: true})
    lessor_type:string;
    @Column({type: "double", nullable: true})
    scp1scp2_emissions_lessor:number

    @Column({default: null, nullable: true})
    scp1scp2_emissions_lessor_unit:string


    @Column({type: "double", nullable: true})
    lease_assests_ratio:number

    @Column({type: "double", nullable: true})
    total_floor_space:number

    @Column({default: null, nullable: true})
    total_floor_space_unit:string

    @Column({type: "double",default: 0})
    user_input_ef

    @Column({default: null, nullable: true})
    building_type:string

    @Column({type: "double", nullable: true})
    number_of_assets:number

    @Column({default: null, nullable: true})
    asset_type:string


    @Column({type: "double",default: 0})
    emission: number;

    @Column()
    groupNo: string
}
