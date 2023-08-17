import { BaseDataDto } from "./emission-base-data.dto";

export class ElectricityDto {
  year: number;
  ec: number;
  ec_unit: string;
  baseData: BaseDataDto;
}
