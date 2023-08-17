import { TransportMode } from "src/emission/enum/transport.enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { WasteActivity } from "./waste-activity.entity";
import { PurchasedGoodsAndServicesMethod } from "../enum/purchased-good-and-services-method.enum";

@Entity()
export class PurchasedGoodsAndServicesActivityData extends WasteActivity{ 

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    year: number;

    @Column()
    month: number;

    @Column({nullable: true})
    groupNo: string

    @Column()
    mode: PurchasedGoodsAndServicesMethod

    @Column({default: '', nullable: true})
    typeName: string

    @Column({nullable: true, default: null})
    supplierType: string

    @Column({type: "double", nullable: true})
    supplierQuantity: number
    
    @Column({nullable: true, default: null})
    supplierQuantity_unit: string
    
    @Column({type: "double", nullable: true})
    supplierEF: number
    
    @Column({nullable: true, default: null})
    supplierEF_unit: string
    
    @Column({type: "double", nullable: true})
    purchaseEmission: number
    
    @Column({nullable: true, default: null})
    purchaseType: string
    
    @Column({nullable: true, default: null})
    purchaseEmission_unit: string
    
    @Column({nullable: true, default: null})
    materialType: string
    
    @Column({type: "double", nullable: true})
    materialAmount: number
    
    @Column({nullable: true, default: null})
    materialAmount_unit: string
    
    @Column({type: "double", nullable: true})
    materialEF: number
    
    @Column({nullable: true, default: null})
    materialEF_unit: string
    
    @Column({nullable: true, default: null})
    materialTransType: string
    
    @Column({type: "double", nullable: true})
    distance: number
    
    @Column({nullable: true, default: null})
    distance_unit: string
    
    @Column({type: "double", nullable: true})
    materialTransAmount: number
    
    @Column({nullable: true, default: null})
    materialTransAmount_unit: string
    
    @Column({type: "double", nullable: true})
    materialTransEF: number
    
    @Column({nullable: true, default: null})
    materialTransEF_unit: string
    
    @Column({type: "double", nullable: true})
    otherEmission: number
    
    @Column({nullable: true, default: null})
    otherEmission_unit: string
    
    @Column({nullable: true, default: null})
    wasteType: string
    
    @Column({type: "double", nullable: true})
    wasteAmount: number
    
    @Column({nullable: true, default: null})
    wasteAmount_unit: string
    
    @Column({nullable: true, default: null})
    averageType: string
    
    @Column({type: "double", nullable: true})
    averageAmount: number
    
    @Column({nullable: true, default: null})
    averageAmount_unit: string
    
    @Column({type: "double", nullable: true})
    averageEF: number
    
    @Column({nullable: true, default: null})
    averageEF_unit: string
    
    @Column({nullable: true, default: null})
    spendType: string
    
    @Column({type: "double", nullable: true})
    spendAmount: number
    
    @Column({nullable: true, default: null})
    spendAmount_unit: string
    
    @Column({type: "double", nullable: true})
    spendEF: number
    
    @Column({nullable: true, default: null})
    spendEF_unit: string
}
