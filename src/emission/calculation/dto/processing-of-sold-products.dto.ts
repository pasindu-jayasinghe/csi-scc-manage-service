import { AverageDataMethodData, SiteSpecificMethodCO2Data,} from "src/emission/processing-of-sold-product/dto/processing-of-sold-product-dto.dto";
import { BaseDataDto } from "./emission-base-data.dto";

export class ProcessingOfSoldProductsDto {
    year: number;
    month: number;



    emission: number;

    activityType:string;
    data: SiteSpecificMethodCO2Data | AverageDataMethodData ;

   
    baseData: BaseDataDto;  
    groupNumber:string;
    



}

