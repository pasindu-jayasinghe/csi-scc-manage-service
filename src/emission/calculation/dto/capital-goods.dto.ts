import { cgBasedData } from "src/emission/capital-goods/dto/capital-goods.dto";
import { wasteBasedData } from "src/emission/EOLT-SoldProducts/dto/eoltSoldProducts.dto";
import { BaseDataDto } from "./emission-base-data.dto";

export class capitalGoodsDto {
    year: number;
    month: number;
    emission: number;
    data:cgBasedData
    baseData: BaseDataDto;  
    groupNumber:string;
    
}
  