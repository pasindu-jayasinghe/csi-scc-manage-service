import { elecBasedData, fuelBsedData, purchsoldBasedData, tanddBasedData } from "src/emission/fuel_energy_related_activities/dro/fuel_energy_related_activities.dto";
import { BaseDataDto } from "./emission-base-data.dto";

export class FuelEnergyRelatedActivitiesDto {
    year: number;
    month: number;
   
    data:fuelBsedData|elecBasedData|tanddBasedData|purchsoldBasedData;
    groupNumber:string;
    emission: number;


    activityType:string;
    baseData: BaseDataDto;  
}
  