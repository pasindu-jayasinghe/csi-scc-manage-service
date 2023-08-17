import { BaseDataDto } from "./emission-base-data.dto";

export class municipalWaterDto {
    year:number;
    unit:string;
    consumption: number;
    meterNo : string;
    baseData: BaseDataDto;
    category: string;
  }