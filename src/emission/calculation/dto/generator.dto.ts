import { BaseDataDto } from "./emission-base-data.dto";

export class GeneratorDto {
    year: number;
    month: number;
    fc:number;
    unit:string;
    fuelType:string;
    baseData: BaseDataDto;  
}
  