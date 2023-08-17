import { BaseDataDto } from "./emission-base-data.dto";

export class BusinessTravelDto {
    mode: string;
    method: string;
    year:number;
    month: number;
    fuel: FuelBaseDto;
    distance: DistanceBaseDto; 
    baseData: BaseDataDto;
}

export class FuelBaseDto {
    businessTravel: FBusinessTravelDto;
    empCommuting: FEmpCommutingDto;
}

export class DistanceBaseDto {
    fe: number;
    fe_unit: string;
    businessTravel: DBusinessTravelDto;
    empCommuting: DEmpCommutingDto;
}

export class FBusinessTravelDto {
    fuelType: string;
    fc:number;
    fc_unit:string;
    trips: number;
}

export class DBusinessTravelDto {
    fuelType: string;
    distance: number; //one way and two way up
    distance_unit: string;
    trips: number;
    cost: number;
    twoWay: boolean;
}

export class FEmpCommutingDto {
    petrolConsumption: number;
    petrolConsumption_unit: string;
    dieselConsumption: number;
    dieselConsumption_unit: string;
    workingDays: number;
}

export class DEmpCommutingDto {
    fuelType: string;
    privateDistance: number;
    privateDistance_unit: string; 
    hiredfuelType: string;
    hiredDistance: number;
    hiredDistance_unit: string;
    hiredfe: number;
    hiredfe_unit: string;
    publicDistance: number;
    publicDistance_unit: string;
    publicMode: string;
    workingDays: number;
}