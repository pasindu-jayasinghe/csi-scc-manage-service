import { BaseDataDto } from "./emission-base-data.dto";

export class PassengerRailDto {
    mode: string;
    year: number;
    month: number;
    fuelType: string;
    fuel: FuelBaseDto;
    distance: DistanceBaseDto;
    baseData: BaseDataDto;
}

export class FuelBaseDto {
    fc: number;
    fc_unit: string;
}

export class DistanceBaseDto {
    distance: number;
    distance_unit: string;
    fe: number;
    fe_unit: string;
    trips: number;
    twoWay: boolean;
}