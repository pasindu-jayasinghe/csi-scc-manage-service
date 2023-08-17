import { BaseDataDto } from "./emission-base-data.dto";

export class wasteDisposalDto {
    year:number;
    disposalMethod:string;
    amountDisposed: number;
    wasteType : string;
    amountDisposedUnit: string;
    baseData: BaseDataDto;
    month: number;
  }