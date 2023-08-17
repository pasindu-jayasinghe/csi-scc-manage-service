import { leasedDataLeasedAssetsDownstreamLeasedAssetsEmissionSourceData, leasedDataLeasedBuildingsDownstreamLeasedAssetsEmissionSourceData, LessorDataLessorSpecificDownstreamLeasedAssetsEmissionSourceData, RefrigerantAssetSpecificDownstreamLeasedAssetsEmissionSourceData, FuelBaseAssetSpecificDownstreamLeasedAssetsEmissionSourceData } from "src/emission/downstream-leased-assets/dto/downstream-leased-assets-dto.dto";
import { BaseDataDto } from "./emission-base-data.dto";

export class DownstreamLeasedAssetsDto {
    year: number;
    month: number;

    method: string;

    emission: number;

    data: leasedDataLeasedAssetsDownstreamLeasedAssetsEmissionSourceData | leasedDataLeasedBuildingsDownstreamLeasedAssetsEmissionSourceData | LessorDataLessorSpecificDownstreamLeasedAssetsEmissionSourceData | RefrigerantAssetSpecificDownstreamLeasedAssetsEmissionSourceData | FuelBaseAssetSpecificDownstreamLeasedAssetsEmissionSourceData;

   
    baseData: BaseDataDto;  
    groupNumber:string;
    



}