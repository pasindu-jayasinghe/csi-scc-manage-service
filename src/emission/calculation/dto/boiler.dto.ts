import { BaseDataDto } from "./emission-base-data.dto";

export class BoilerDto {
    year: number;
    purpose: string;
    fuelType: string;
    consumption: number;
    consumption_unit: string;
    fuel: string;
    baseData: BaseDataDto
  }
  