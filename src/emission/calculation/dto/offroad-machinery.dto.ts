import { BaseDataDto } from "./emission-base-data.dto";

export class OffroadMachineryDto {
    mode: string;
    fuelType: string;
    year: number;
    fuel: FuelBaseDto;
    industry: string;
    baseData: BaseDataDto;
}

export class FuelBaseDto {
    fc: number;
    fc_unit: string;
    stroke: string;
}