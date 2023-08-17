import { wasteBasedData } from "src/emission/EOLT-SoldProducts/dto/eoltSoldProducts.dto";
import { BaseDataDto } from "./emission-base-data.dto";

export class eoltSoldProductsDto {
    year: number;
    month: number;
    emission: number;
    data:wasteBasedData
    baseData: BaseDataDto;  
    groupNumber:string;
    
}
  