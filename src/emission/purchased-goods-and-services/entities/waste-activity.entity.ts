import { EmissionBaseEntity } from "src/emission/emission.base.entity";
import { Column } from "typeorm";
import { WasteActivities } from "../enum/purchased-good-and-services-method.enum";

export abstract class WasteActivity extends EmissionBaseEntity{

    @Column({nullable: true, default: ''})
    waste_activity: WasteActivities;

    //Biological treatment

    @Column({nullable: true, default: null})
    gas_type: string;

    @Column({nullable: true, default: null})
    wasteBasis: string;

    @Column({nullable: true, default: null})
    biologicalTreatmentSystem: string;

    @Column({nullable: true, default: null})
    wasteCategory: string;

    @Column({nullable: true, default: null})
    typeOfWaste: string;

    //waste incineration

    //gas_type, wasteCategory, typeOfWaste

    @Column({nullable: true, default: null})
    mswType: string;

    // @Column()
    // co2EfType: string;

    // open burning of waste

    // gas_type, mswType, wasteCategory, typeOfWaste

    // domestic waste water

    @Column({nullable: true, default: null})
    treatmentDischargeType: string;

    // industrial waste water
    // treatmentDischargeType

    // solid waste disposal

    @Column({nullable: true, default: null})
    approach: string;

    @Column({nullable: true, default: null})
    climateZone: string;

    @Column({nullable: true, default: null})
    efType: string;

    @Column({nullable: true, default: null})
    efCategory: string; //food waste, garden, paper, textiles

    // defra

    @Column({nullable: true, default: null})
    waste: string;

    @Column({nullable: true, default: null})
    disposalMethod: string;

    // incineration
    // waste


}