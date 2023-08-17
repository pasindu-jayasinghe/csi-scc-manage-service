import { BaseDataDto } from "./emission-base-data.dto";

export class ForkliftsDto {
    year:number;
    consumption:number;
    fuelType:string; 
    consumption_unit: string; 
    //E_RL: number;
    baseData: BaseDataDto;
  
  }