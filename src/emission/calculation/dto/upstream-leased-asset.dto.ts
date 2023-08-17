import { methodABasedData, methodBBasedData, methodCBasedData, methodDBasedData, methodEBasedData } from "src/emission/investments/dto/investments.dto";
import { AssetSpecificMethodData, LeasedAssetsMethodData, LeasedBuildingsMethodData, LessorSpecificMethodData } from "src/emission/upstream-leased-assets/dto/upstream-leased-assets-dto.dto";
import { BaseDataDto } from "./emission-base-data.dto";


export class UpstreamLeasedAssetssDto {
    year: number;
    month: number;



    emission: number;

    activityType:string;
    data: AssetSpecificMethodData | LessorSpecificMethodData | LeasedBuildingsMethodData | LeasedAssetsMethodData;

   
    baseData: BaseDataDto;  
    groupNumber:string;
    



}
  