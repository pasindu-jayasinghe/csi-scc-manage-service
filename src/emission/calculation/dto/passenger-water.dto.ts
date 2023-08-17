import { BaseDataDto } from "./emission-base-data.dto";

export class PassengerWaterDto {
    mode: string;
    year: number;
    month: number;
    fuelType: string;
    fuel: FuelBaseDto;
    baseData: BaseDataDto;
}

export class FuelBaseDto {
    fc: number;
    fc_unit: string;
}