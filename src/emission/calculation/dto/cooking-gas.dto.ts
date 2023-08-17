import { BaseDataDto } from "./emission-base-data.dto";

export class CookingGasDto {
    year: number;
    fcn: number;
    emissionSource: string;
    gasType: string;
    fcnUnit: string;
    baseData: BaseDataDto;
  }
  