import { BaseDataDto } from "./emission-base-data.dto";

export class WasteWaterTreatmentDto {
    year:number;
    tip:number;
    wasteGenerated: number;
    cod: number;
    anaerobicDeepLagoon : string;
    sludgeRemoved : number;
    recoveredCh4 : number;
    tip_unit: string;
    wasteGenerated_unit: string;
    cod_unit: string;
    sludgeRemoved_unit: string;
    recoveredCh4_unit: string;
    baseData: BaseDataDto;
    
  
  }