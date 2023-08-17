import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { WasteGeneratedInOperationsEmissionSourceDataMethod, WasteGeneratedInOperationsEmissionSourceDataSolidWater } from "../dto/waste-generated-in-operations-dto.dto";


@Entity()
export class WasteGeneratedInOperationsActivityData extends EmissionBaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    month: number;

    @Column()
    year: number;

    @Column({
        type: "enum",
        enum: WasteGeneratedInOperationsEmissionSourceDataMethod,
        default: null,
        nullable: true
    })
    method: WasteGeneratedInOperationsEmissionSourceDataMethod;

    @Column({default: null, nullable: true})
    company: string;

   
 

    @Column({type: "double", nullable: true})
    scpoeOne:number;

    @Column({default: null, nullable: true})
    scpoeOne_unit: string;

    @Column({type: "double", nullable: true})
    scpoeTwo:number;

    @Column({default: null, nullable: true})
    scpoeTwo_unit: string;

    @Column({
        type: "enum",
        enum: WasteGeneratedInOperationsEmissionSourceDataSolidWater,
        default: null,
        nullable: true
    })
   
    solid_or_water:WasteGeneratedInOperationsEmissionSourceDataSolidWater


    @Column({default: null, nullable: true})
    wasteType: string;

    @Column({default: null, nullable: true})
    disposalType: string; 
    
    // @Column({type: "double", nullable: true})
    // wasteTypeEF:number; 

    @Column({type: "double", nullable: true})
    wasteProdused:number;

    @Column({default: null, nullable: true})
    wasteProdused_unit: string;




   

    @Column({default: null, nullable: true})
    treatmentMethod: string;


    @Column({type: "double", nullable: true})
    massOfWaste:number;

    @Column({default: null, nullable: true})
    massOfWaste_unit: string;


    @Column({type: "double", nullable: true})
    proportionOfWaste:number;
   



    @Column({type: "double",default: 0})
    emission: number;

    @Column({type: "double",default: 0})
    user_input_ef
    @Column()
    groupNo: string

}
