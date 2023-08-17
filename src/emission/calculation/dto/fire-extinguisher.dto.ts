import { BaseDataDto } from "./emission-base-data.dto";

export class FireExtinguisherDto {
    year: number;
    fet: string;
    wwpt:number;
    not:number;
    wwpt_unit: string;
    stype:string;
    baseData: BaseDataDto;
  }