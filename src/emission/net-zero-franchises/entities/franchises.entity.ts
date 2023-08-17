import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { FranchisesEmissionSourceDataMethod } from "../dto/franchises-dto.dto";

@Entity()
export class FranchisesActivityData extends EmissionBaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    month: number;

    @Column()
    year: number;

    @Column({
        type: "enum",
        enum: FranchisesEmissionSourceDataMethod,
        default: null,
        nullable: true
    })
    method: FranchisesEmissionSourceDataMethod;

    @Column({ default: null, nullable: true })
    type: string;


    @Column({ default: '' })
    typeName: string;


    // SpecificMethodParameters
    @Column({ type: 'double', nullable: true })
    scopeOneEmission: number;

    @Column({ default: null, nullable: true })
    scopeOneEmission_unit: string;

    @Column({ type: 'double', nullable: true })
    scopeTwoEmission: number;

    @Column({ default: null, nullable: true })
    scopeTwoEmission_unit: string;



    // NotSubMeteredParameters  --------------------------------------------------------
    @Column({ type: 'double', nullable: true })
    franchises_area: number;

    @Column({ default: null, nullable: true })
    franchises_area_unit: string;

    @Column({ type: 'double', nullable: true })
    building_total_area: number;

    @Column({ default: null, nullable: true })
    building_total_area_unit: string;

    @Column({ type: 'double', nullable: true })
    building_occupancy_rate: number;

    @Column({ default: null, nullable: true })
    building_occupancy_rate_unit: string;

    @Column({ type: 'double', nullable: true })
    building_total_energy_use: number

    @Column({ default: null, nullable: true })
    building_total_energy_use_unit: string


    //SampleGroupParameters  -------------------------------------------------------------
    @Column({ type: 'double', nullable: true })
    total_e_of_sampled_franchises: number;

    @Column({ type: 'double', nullable: true })
    total_number_of_franchises: number;

    @Column({ type: 'double', nullable: true })
    number_of_franchises_sampled: number;


    //AverageDataMethodFloorSpaceDataParameters  ----------------------------------------
    @Column({ type: 'double', nullable: true })
    building_type_total_floor_space: number;

    @Column({ default: null, nullable: true })
    building_type_total_floor_space_unit: string;

    @Column({ type: 'double', nullable: true })
    building_type_average_emission_factor: number;

    @Column({ default: null, nullable: true })
    building_type_average_emission_factor_unit: string;

    @Column({ default: null, nullable: true })
    building_type: string;


    //AverageDataMethodNotFloorSpaceDataParameters ----------------------------------------
    @Column({ type: 'double', nullable: true })
    number_of_buildings: number;

    @Column({ type: 'double', nullable: true })
    average_emissions_of_building: number;

    @Column({ default: null, nullable: true })
    average_emissions_of_building_unit: string;

    @Column({ default: null, nullable: true })
    asset_type: string;

    




    @Column({ type: "double", default: 0 })
    emission: number;

    // @Column({type: "double",default: 0})
    // user_input_ef
    @Column()
    groupNo: string

}
