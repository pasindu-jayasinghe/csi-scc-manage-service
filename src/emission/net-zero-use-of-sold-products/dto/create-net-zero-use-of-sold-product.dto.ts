import { User } from "src/users/user.entity";
import { UseOfSoldProductsMethod } from "../enum/use-of-sold-products-method.enum";
import { Unit } from "src/unit/entities/unit.entity";
import { Project } from "src/project/entities/project.entity";
import { ActivityDataStatus } from "src/emission/enum/activity-data-status.enum";

export class CreateNetZeroUseOfSoldProductDto {
    month: number;
    year: number;
    method: UseOfSoldProductsMethod;
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

    directEnergy: DirectEnergy
    directCombusted: DirectCombusted
    directGreenhouse: DirectGreenhouse
    indirectEnergy: IndirectEnergy 
    intermediateProducts: IntermediateProducts
}

export class DirectEnergy {
    fuelData: FuelData[]
    electricityData: ElectricityData[]
    refrigerantData: RefrigerantData[]

    constructor(){
        this.fuelData = []
        this.electricityData = []
        this.refrigerantData = []
    }
}

export class FuelData{
    id:number;
    typeName: string;
    fuel_type: string;
    fuel_lifetime: number;
    fuel_number_of_sold: number;
    fuel_consumption: number
    fuel_consumption_unit: string

    static getResObject() {
        let obj = new FuelData()
        obj.typeName = '';
        obj.fuel_type = '';
        obj.fuel_lifetime = 0;
        obj.fuel_number_of_sold = 0;
        obj.fuel_consumption = 0;
        obj.fuel_consumption_unit = '';

        return obj;
    }
} 

export class ElectricityData {
    id:number;
    typeName: string; 
    elec_lifetime: number;
    elec_number_of_sold: number;
    elec_consumption: number
    elec_consumption_unit: string;

    static getResObject() {
        let obj = new ElectricityData()
        obj.typeName = '';
        obj.elec_lifetime = 0;
        obj.elec_number_of_sold = 0;
        obj.elec_consumption = 0;
        obj.elec_consumption_unit = '';

        return obj;
    }
}

export class RefrigerantData {
    id:number;
    typeName: string;
    ref_type: string;
    ref_lifetime: number;
    ref_number_of_sold: number;
    ref_leakage: number
    ref_leakage_unit: string

    static getResObject() {
        let obj = new RefrigerantData()
        obj.typeName = '';
        obj.ref_type = '';
        obj.ref_lifetime = 0;
        obj.ref_number_of_sold = 0;
        obj.ref_leakage = 0;
        obj.ref_leakage_unit = '';

        return obj;
    }
}

export class DirectCombusted {
    combustedData: CombustedData[]

    constructor(){
        this.combustedData = [];
    }
}

export class CombustedData {
    id:number;
    typeName: string;
    fuel_type: string;
    total_quantity: number;
    total_quantity_unit: string;

    static getResObject() {
        let obj = new CombustedData();
        obj.typeName = '';
        obj.fuel_type = '';
        obj.total_quantity = 0;
        obj.total_quantity_unit = '';

        return obj;
    }

}
export class DirectGreenhouse {
    greenhouseData: GreenhouseData[]

    constructor(){
        this.greenhouseData = []
    }
}

export class GreenhouseData {
    id:number;
    typeName: string;
    ghg_type: string;
    ghg_amount: number;
    ghg_amount_unit: string;
    number_of_products: number;
    percentage_of_released: number;

    static getResObject() {
        let obj = new GreenhouseData();
        obj.typeName = '';
        obj.ghg_type = '';
        obj.ghg_amount = 0;
        obj.ghg_amount_unit = '';
        obj.number_of_products = 0;
        obj.percentage_of_released = 0;

        return obj;
    }
}
export class IndirectEnergy {
    fuelData: IndirectFuelData[]
    electricityData: IndirectElectricityData[]
    refrigerantData: IndirectRefrigerantdata[]
    ghgData: IndirectGHGData[]

    constructor() {
        this.fuelData = [];
        this.electricityData = [];
        this.refrigerantData = [];
        this.ghgData = [];
    }
}

export class IndirectFuelData {
    id:number;
    typeName: string;
    fuel_type: string;
    indir_fuel_lifetime: number;
    indir_fuel_percentage_of_lifetime: number;
    indir_fuel_number_of_sold: number;
    indir_fuel_consumption: number;
    indir_fuel_consumption_unit: string;

    static getResObject() {
        let obj = new IndirectFuelData();
        obj.typeName = '';
        obj.fuel_type = '';
        obj.indir_fuel_lifetime = 0;
        obj.indir_fuel_percentage_of_lifetime = 0;
        obj.indir_fuel_number_of_sold = 0;
        obj.indir_fuel_consumption = 0;
        obj.indir_fuel_consumption_unit = '';

        return obj;
    }
}

export class IndirectElectricityData{
    id:number;
    typeName: string;
    indir_elec_lifetime: number;
    indir_elec_percentage_of_lifetime: number;
    indir_elec_number_of_sold: number;
    indir_elec_consumption: number;
    indir_elec_consumption_unit: string;

    static getResObject() {
        let obj = new IndirectElectricityData();
        obj.typeName  = '';
        obj.indir_elec_lifetime = 0;
        obj.indir_elec_percentage_of_lifetime = 0;
        obj.indir_elec_number_of_sold = 0;
        obj.indir_elec_consumption = 0;
        obj.indir_elec_consumption_unit = '';

        return obj;
    }
}

export class IndirectRefrigerantdata {
    id:number;
    typeName: string;
    ref_type: string;
    indir_ref_lifetime: number;
    indir_ref_percentage_of_lifetime: number;
    indir_ref_number_of_sold: number;
    indir_ref_leakage: number;
    indir_ref_leakage_unit: string;

    static getResObject() {
        let obj = new IndirectRefrigerantdata()
        obj.typeName = '';
        obj.ref_type = '';
        obj.indir_ref_lifetime = 0;
        obj.indir_ref_percentage_of_lifetime = 0;
        obj.indir_ref_number_of_sold = 0;
        obj.indir_ref_leakage = 0;
        obj.indir_ref_leakage_unit = '';

        return obj;
    }
}

export class IndirectGHGData {
    id:number;
    typeName: string;
    indir_ghg_lifetime: number;
    ghg_type: string;
    indir_ghg_percentage_of_lifetime: number;
    indir_ghg_number_of_sold: number;
    indir_ghg_emit: number;
    indir_ghg_emit_unit: string;

    static getResObject() {
        let obj = new IndirectGHGData();
        obj.typeName = '';
        obj.ghg_type = '';
        obj.indir_ghg_lifetime = 0;
        obj.indir_ghg_percentage_of_lifetime = 0;
        obj.indir_ghg_number_of_sold = 0;
        obj.indir_ghg_emit = 0;
        obj.indir_ghg_emit_unit = '';

        return obj;
    }
}
export class IntermediateProducts {
    intermediateData: IntermediateData[]

    constructor(){
        this.intermediateData = [];
    }
}

export class IntermediateData {
    id:number;
    typeName: string;
    product_type: string;
    intermediate_sold: number;
    intermediate_lifetime: number;
    intermediate_ef: number;
    intermediate_ef_unit: string;

    static getResObject() {
        let obj = new IntermediateData();
        obj.typeName = '';
        obj.product_type = '';
        obj.intermediate_sold = 0;
        obj.intermediate_lifetime = 0;
        obj.intermediate_ef = 0;
        obj.intermediate_ef_unit = '';

        return obj;
    }

}