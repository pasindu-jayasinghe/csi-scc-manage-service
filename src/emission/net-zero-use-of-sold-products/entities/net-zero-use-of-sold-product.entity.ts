import { BaseTrackingEntity } from "src/shared/entities/base.tracking.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UseOfSoldProductsMethod, UseOfSoldProductsTypeNames } from "../enum/use-of-sold-products-method.enum";
import { EmissionBaseEntity } from "src/emission/emission.base.entity";

@Entity()
export class NetZeroUseOfSoldProductActivityData extends EmissionBaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    year: number;

    @Column()
    month: number;

    @Column({ nullable: true })
    groupNo: string

    @Column()
    mode: UseOfSoldProductsMethod

    @Column({ nullable: true, default: null })
    typeName: UseOfSoldProductsTypeNames;

    @Column({ default: null, nullable: true })
    fuel_type: string

    @Column({ default: null, nullable: true })
    ref_type: string

    @Column({ default: null, nullable: true })
    ghg_type: string

    @Column({ default: null, nullable: true })
    product_type: string

    @Column({ type: 'double', nullable: true })
    fuel_lifetime: number

    @Column({ type: 'double', nullable: true })
    fuel_number_of_sold: number

    @Column({ type: 'double', nullable: true })
    fuel_consumption: number

    @Column({ default: null, nullable: true })
    fuel_consumption_unit: string

    @Column({ type: 'double', nullable: true })
    elec_lifetime: number

    @Column({ type: 'double', nullable: true })
    elec_number_of_sold: number

    @Column({ type: 'double', nullable: true })
    elec_consumption: number

    @Column({ default: null, nullable: true })
    elec_consumption_unit: string

    @Column({ type: 'double', nullable: true })
    ref_lifetime: number

    @Column({ type: 'double', nullable: true })
    ref_number_of_sold: number

    @Column({ type: 'double', nullable: true })
    ref_leakage: number

    @Column({ default: null, nullable: true })
    ref_leakage_unit: string

    @Column({ type: 'double', nullable: true })
    total_quantity: number

    @Column({ default: null, nullable: true })
    total_quantity_unit: string

    @Column({ type: 'double', nullable: true })
    ghg_amount: number

    @Column({ default: null, nullable: true })
    ghg_amount_unit: string

    @Column({ type: 'double', nullable: true })
    number_of_products: number

    @Column({ type: 'double', nullable: true })
    percentage_of_released: number

    @Column({ type: 'double', nullable: true })
    indir_fuel_lifetime: number

    @Column({ type: 'double', nullable: true })
    indir_fuel_percentage_of_lifetime: number

    @Column({ type: 'double', nullable: true })
    indir_fuel_number_of_sold: number

    @Column({ type: 'double', nullable: true })
    indir_fuel_consumption: number

    @Column({ default: null, nullable: true })
    indir_fuel_consumption_unit: string

    @Column({ type: 'double', nullable: true })
    indir_elec_lifetime: number

    @Column({ type: 'double', nullable: true })
    indir_elec_percentage_of_lifetime: number

    @Column({ type: 'double', nullable: true })
    indir_elec_number_of_sold: number

    @Column({ type: 'double', nullable: true })
    indir_elec_consumption: number

    @Column({ default: null, nullable: true })
    indir_elec_consumption_unit: string

    @Column({ type: 'double', nullable: true })
    indir_ref_lifetime: number

    @Column({ type: 'double', nullable: true })
    indir_ref_percentage_of_lifetime: number

    @Column({ type: 'double', nullable: true })
    indir_ref_number_of_sold: number

    @Column({ type: 'double', nullable: true })
    indir_ref_leakage: number

    @Column({ default: null, nullable: true })
    indir_ref_leakage_unit: string

    @Column({ type: 'double', nullable: true })
    indir_ghg_lifetime: number

    @Column({ type: 'double', nullable: true })
    indir_ghg_percentage_of_lifetime: number

    @Column({ type: 'double', nullable: true })
    indir_ghg_number_of_sold: number

    @Column({ type: 'double', nullable: true })
    indir_ghg_emit: number

    @Column({ default: null, nullable: true })
    indir_ghg_emit_unit: string

    @Column({ type: 'double', nullable: true })
    intermediate_sold: number

    @Column({ type: 'double', nullable: true })
    intermediate_lifetime: number

    @Column({ type: 'double', nullable: true })
    intermediate_ef: number

    @Column({ default: null, nullable: true })
    intermediate_ef_unit: string
}
