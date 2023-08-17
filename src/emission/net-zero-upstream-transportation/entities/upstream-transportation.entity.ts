import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UpstreamTransportationEmissionSourceDataMethod } from "../dto/upstream-transportation-dto.dto";

@Entity()
export class UpstreamTransportationActivityData extends EmissionBaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    month: number;

    @Column()
    year: number;

    @Column({
        type: "enum",
        enum: UpstreamTransportationEmissionSourceDataMethod,
        default: null,
        nullable: true
    })
    method: UpstreamTransportationEmissionSourceDataMethod;

    @Column({ default: null, nullable: true })
    type: string;


    @Column({ default: '' })
    typeName: string;


    // FUEL_BASE_METHOD ------------------------------------------------------------

    // ----- FUEL_DATA -----
    @Column({ type: 'double', nullable: true })
    quantity_of_fuel_consumed: number;
    @Column({ default: null, nullable: true })
    quantity_of_fuel_consumed_unit: string;
    @Column({ default: null, nullable: true })
    fuelBasefuelType: string;

    // ----- ELECTRICITY_DATA -----
    @Column({ type: 'double', nullable: true })
    quantity_of_electricity_consumed: number;
    @Column({ default: null, nullable: true })
    quantity_of_electricity_consumed_unit: string;
    @Column({ default: null, nullable: true })
    grid_region: string;


    // ----- REFRIGENT_DATA -----
    @Column({ type: 'double', nullable: true })
    quantity_of_refrigerent_leaked: number;
    @Column({ default: null, nullable: true })
    quantity_of_refrigerent_leaked_unit: string;
    @Column({ default: null, nullable: true })
    fuelBaseRefrigerantType: string;
    
    // ----- BACKHAUL_DATA -----
    @Column({ type: 'double', nullable: true })
    quantity_of_fuel_consumed_from_backhaul: number;
    @Column({ default: null, nullable: true })
    quantity_of_fuel_consumed_from_backhaul_unit: string;
    @Column({ default: null, nullable: true })
    fuelBaseBackhaulFuelType: string;

    // DISTANCE_BASE_METHOD --------------------------------------------------------
    @Column({ type: 'double', nullable: true })
    mass_of_goods_purchased: number;
    @Column({ default: null, nullable: true })
    mass_of_goods_purchased_unit: string;
    @Column({ type: 'double', nullable: true })
    distance_travelled_in_transport_leg: number;
    @Column({ default: null, nullable: true })
    distance_travelled_in_transport_leg_unit: string;    
    @Column({ default: null, nullable: true })
    vehicle_type: string;

    // SPEND_BASE_METHOD -----------------------------------------------------------
    @Column({ type: 'double', nullable: true })
    amount_spent_on_transportation_by_type: number;
    @Column({ default: null, nullable: true })
    amount_spent_on_transportation_by_type_unit: string;
    @Column({ type: 'double', nullable: true })
    shareOfTotalProjectCosts: number;
    @Column({ default: null, nullable: true })
    shareOfTotalProjectCosts_unit: string;
    @Column({ type: 'double', nullable: true })
    eEIO_factor: number;
    @Column({ default: null, nullable: true })
    eEIO_factor_unit: string;

    // SITE_SPECIFIC_METHOD --------------------------------------------------------
    @Column({ type: 'double', nullable: true })
    volume_of_reporting_companys_purchased_goods: number;
    @Column({ default: null, nullable: true })
    volume_of_reporting_companys_purchased_goods_unit: string;
    @Column({ type: 'double', nullable: true })
    total_volume_of_goods_in_storage_facility: number;
    @Column({ default: null, nullable: true })
    total_volume_of_goods_in_storage_facility_unit: string;
    @Column({ type: 'double', nullable: true })
    fuel_consumed: number;
    @Column({ default: null, nullable: true })
    fuel_consumed_unit: string;
    @Column({ type: 'double', nullable: true })
    electricity_consumed: number;
    @Column({ default: null, nullable: true })
    electricity_consumed_unit: string;
    @Column({ type: 'double', nullable: true })
    refrigerant_leakage: number;
    @Column({ default: null, nullable: true })
    refrigerant_leakage_unit: string;
    @Column({ default: null, nullable: true })
    refrigerantType: string;
    @Column({ default: null, nullable: true })
    fuelType: string;
    
    // AVERAGE_DATA_METHOD ---------------------------------------------------------
    @Column({ type: 'double', nullable: true })
    average_number_of_days_stored: number;
    @Column({ type: 'double', nullable: true })
    storage_facility_ef: number;
    @Column({ default: null, nullable: true })
    storage_facility_ef_unit: string;
    @Column({ type: 'double', nullable: true })
    volume_of_stored_goods: number;
    @Column({ default: null, nullable: true })
    volume_of_stored_goods_unit: string;


    @Column({ type: "double", default: 0 })
    emission: number;

    // @Column({type: "double",default: 0})
    // user_input_ef
    @Column()
    groupNo: string

}
