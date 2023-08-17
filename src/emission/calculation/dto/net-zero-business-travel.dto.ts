import { AmountSpendBasedNetZeroBusinessTravelEmissionSourceData, FuelFuelBasedNetZeroBusinessTravelEmissionSourceData, GridFuelBasedNetZeroBusinessTravelEmissionSourceData, HotelDistanceBasedNetZeroBusinessTravelEmissionSourceData, RefrigerantFuelBasedNetZeroBusinessTravelEmissionSourceData, VehicleDistanceBasedNetZeroBusinessTravelEmissionSourceData } from "src/emission/net-zero-business-travel/dto/net-zero-business-travel-dto.dto";
import { BaseDataDto } from "./emission-base-data.dto";

export class NetZeroBusinessTravelDto{
    
    month: number;

   
    year: number;

   
    method: string;

    data:VehicleDistanceBasedNetZeroBusinessTravelEmissionSourceData | HotelDistanceBasedNetZeroBusinessTravelEmissionSourceData|AmountSpendBasedNetZeroBusinessTravelEmissionSourceData|FuelFuelBasedNetZeroBusinessTravelEmissionSourceData|GridFuelBasedNetZeroBusinessTravelEmissionSourceData|RefrigerantFuelBasedNetZeroBusinessTravelEmissionSourceData;


    groupNumber:string;
    emission: number;

    baseData: BaseDataDto;  
}