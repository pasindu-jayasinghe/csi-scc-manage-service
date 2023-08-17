import { suppressDeprecationWarnings } from "moment";
import { BaseDataDto } from "./emission-base-data.dto";

export class WeldingEsDto {
    year:number;
    ac:number;
    lc: number;
    ac_unit: string
    lc_unit: string;
    baseData: BaseDataDto;
    
  
  }