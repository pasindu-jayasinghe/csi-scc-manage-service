import { User } from "src/users/user.entity";
import { PurchasedGoodsAndServicesMethod, WasteActivities } from "../enum/purchased-good-and-services-method.enum";
import { Unit } from "src/unit/entities/unit.entity";
import { Project } from "src/project/entities/project.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";

export class CreatePurchasedGoodsAndServiceDto {

    month: number;
    year: number;
    method: PurchasedGoodsAndServicesMethod;
    mobile: boolean;
    stationary: boolean;
    user: User;
    unit: Unit;
    project: Project;
    ownership: string;
    direct: boolean;
    indirect: boolean;
    other: boolean;
    activityDataStatus: ActivityDataStatus;
    groupNo: string

    supplierSpecificMethod: SupplierSpecificMethod;
    hybridMethod: hybridMethod;
    averageDataMethod: AverageMethod;
    spendBasedMethod: SpendBasedMethod
}

export class SupplierSpecificMethod{
    supplierData: SupplierData[]
    constructor() {
        this.supplierData = []
      }
}

export class SupplierData{
    id:number;
    typeName: string;
    supplierType: string
    supplierQuantity: number
    supplierQuantity_unit: string
    supplierEF: number
    supplierEF_unit: string

    static getResObject() {
        let obj = new SupplierData();
        obj.typeName = '';
        obj.supplierType = '';
        obj.supplierQuantity = 0;
        obj.supplierQuantity_unit = '';
        obj.supplierEF = 0;
        obj.supplierEF_unit = '';
        return obj;
    }
}

export class hybridMethod{
    purchaseData: PurchaseData[]
    materialData: MaterialData[]
    materialTrasportData: MaterialTransportData[]
    wasteData: WasteData[]
    otherData: WasteOtherData[]

    constructor() {
        this.purchaseData = []
        this.materialData = []
        this.materialTrasportData = []
        this.wasteData = []
        this.otherData = []
    }
}

export class PurchaseData{
    id:number;
    typeName: string;
    purchaseType: string
    purchaseEmission: number
    purchaseEmission_unit: string

    static getResObject() {
        let obj = new PurchaseData()
        obj.typeName = '';
        obj.purchaseType = '';
        obj.purchaseEmission = 0;
        obj.purchaseEmission_unit = '';
        return obj;
    }
}

export class MaterialData{
    id:number;
    typeName: string;
    materialType: string
    materialAmount: number
    materialAmount_unit: string
    materialEF: number
    materialEF_unit: string

    static getResObject() {
        let obj = new MaterialData()
        obj.typeName = '';
        obj.materialType = '';
        obj.materialAmount = 0 ;
        obj.materialAmount_unit = '';
        obj.materialEF = 0;
        obj.materialEF_unit = '';
        return obj;
    }
}

export class MaterialTransportData{
    id:number;
    typeName: string;
    materialTransType: string
    distance: number
    distance_unit: string
    materialTransAmount: number
    materialTransAmount_unit: string
    materialTransEF: number
    materialTransEF_unit: string

    static getResObject() {
        let obj = new MaterialTransportData()
        obj.typeName = '';
        obj.materialTransType = '';
        obj.distance = 0;
        obj.distance_unit = '';
        obj.materialTransAmount = 0;
        obj.materialTransAmount_unit = '';
        obj.materialTransEF = 0;
        obj.materialTransEF_unit = '';
        return obj;
    }
}

export class WasteData{
    id:number;
    typeName: string;
    wasteType: string
    wasteAmount: number
    wasteAmount_unit: string
    waste_activity: WasteActivities;
    gas_type: string;
    wasteBasis: string;
    biologicalTreatmentSystem: string;
    wasteCategory: string;
    typeOfWaste: string;
    mswType: string;
    // co2EfType: string;
    treatmentDischargeType: string;
    approach: string;
    climateZone: string;
    efType: string;
    efCategory: string; 
    waste: string;
    disposalMethod: string;
    // incinerationFactor: string

    static getResObject() {
        let obj = new WasteData();
        obj.typeName = '';
        obj.wasteType = '';
        obj.wasteAmount = 0;
        obj.wasteAmount_unit = '';
        obj.waste_activity = WasteActivities.BIOLOGICAL_TREATMENT;
        obj.gas_type = '';
        obj.wasteBasis = '';
        obj.biologicalTreatmentSystem = '';
        obj.wasteCategory = '';
        obj.typeOfWaste = '';
        obj.mswType = '';
        obj.treatmentDischargeType = '';
        obj.approach = '';
        obj.climateZone = '';
        obj.efType = '';
        obj.efCategory = '';
        obj.waste = '';
        obj.disposalMethod = '';
        return obj;
    }
}

export class WasteOtherData{
    id:number;
    typeName: string;
    otherEmission: number
    otherEmission_unit: string

    static getResObject() {
        let obj = new WasteOtherData()
        obj.typeName = ''
        obj.otherEmission = 0;
        obj.otherEmission_unit = ''
        return obj;
    }
}

export class AverageMethod{
    averageData: AverageData[]
    constructor() {
        this.averageData = []
    }
}

export class AverageData{
    id:number;
    typeName: string;
    averageType: string
    averageAmount: number
    averageAmount_unit: string
    averageEF: number
    averageEF_unit: string

    static getResObject() {
        let obj = new AverageData()
        obj.typeName = '';
        obj.averageType = '';
        obj.averageAmount = 0;
        obj.averageAmount_unit = '';
        obj.averageEF = 0;
        obj.averageEF_unit = '';
        return obj;
    }
}

export class SpendBasedMethod {
    spendData: SpendData[]
    constructor() {
        this.spendData = []
    }
}

export class SpendData{
    id:number;
    typeName: string;
    spendType: string
    spendAmount: number
    spendAmount_unit: string
    spendEF: number
    spendEF_unit: string

    static getResObject() {
        let obj = new SpendData()
        obj.typeName = '';
        obj.spendType = '';
        obj.spendAmount = 0;
        obj.spendAmount_unit = '';
        obj.spendEF = 0;
        obj.spendEF_unit = ''; 
        return obj
    }
}
