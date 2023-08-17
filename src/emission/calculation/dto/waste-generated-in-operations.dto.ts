import { ScopeSupplierSpecificWasteGeneratedInOperationsEmissionSourceData, WasteWasteTypeSpecificWasteGeneratedInOperationsEmissionSourceData, WasteAverageDataWasteGeneratedInOperationsEmissionSourceData } from "src/emission/waste-generated-in-operations/dto/waste-generated-in-operations-dto.dto";
import { BaseDataDto } from "./emission-base-data.dto";

export class WasteGeneratedInOperationsDto{
    
    month: number;

   
    year: number;

   
    method: string;

    data:ScopeSupplierSpecificWasteGeneratedInOperationsEmissionSourceData | WasteWasteTypeSpecificWasteGeneratedInOperationsEmissionSourceData|WasteAverageDataWasteGeneratedInOperationsEmissionSourceData;

    groupNumber:string;
    emission: number;

    baseData: BaseDataDto;  
}
