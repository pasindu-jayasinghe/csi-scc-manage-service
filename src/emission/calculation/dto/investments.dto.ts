import { methodABasedData, methodBBasedData, methodCBasedData, methodDBasedData, methodEBasedData } from "src/emission/investments/dto/investments.dto";
import { BaseDataDto } from "./emission-base-data.dto";


export class InvestmentsDto {
    year: number;
    month: number;



    emission: number;

    activityType:string
    data:methodABasedData|methodBBasedData|methodCBasedData|methodDBasedData|methodEBasedData;

   
    baseData: BaseDataDto;  
    groupNumber:string;
    



}
  