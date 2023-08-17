import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ProcessingOfSoldProductsMethod } from "../dto/processing-of-sold-product-dto.dto";

@Entity()
export class ProcessingOfSoldProductsActivityData extends EmissionBaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    month: number;

    @Column()
    year: number;

    @Column({
        type: "enum",
        enum: ProcessingOfSoldProductsMethod,
        default: null,
        nullable: true
    })
    activityType: ProcessingOfSoldProductsMethod;

    @Column({default: null, nullable: true})
    type: string;

   
    @Column({default: null, nullable: true})
    fuel_type: string;

    @Column({type: "double", nullable: true})
    quntity:number;

  

    @Column({default: null, nullable: true})
    refrigerant_type: string;
 

    @Column({default: null, nullable: true})
    quntity_unit: string;


    @Column({default: null, nullable: true})
    disposalMethod: string;


    @Column({default: null, nullable: true})
    waste_type:string

    @Column({type: "double", nullable: true})
    mass:number

    @Column({default: null, nullable: true})
    mass_unit:string



    @Column({default: null, nullable: true})
    sold_intermediate_type:string


    @Column({default: null, nullable: true})
    sold_intermediate_mass_unit:string


    @Column({type: "double",default: 0})
    emission: number;

    @Column({type: "double",default: 0,nullable:true})
    user_input_ef: number;

    @Column()
    groupNo: string
}
