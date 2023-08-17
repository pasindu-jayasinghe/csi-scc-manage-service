import { BaseDataDto } from "./emission-base-data.dto";


export class FreightWaterDto {
  year:number;
  month: number;
  mode: string;
  fuel:FuelBaseDto;
  distance:DistanceBaseDto;
  baseData: BaseDataDto

}

export class FuelBaseDto{
  fc: number;
  fc_unit: string;
  fuel_type: string;
}

export class DistanceBaseDto{
  distanceUp: number; //one way and two way up, handle distance from port in userservice
  distanceUp_unit: string; 
  weightUp: number; // one way and two way up
  weightUp_unit: string;
  distanceDown: number; //handle distance from port in userservice
  distanceDown_unit: string; 
  weightDown: number;
  weightDown_unit: string;
  costUp: number; // one way and two way up
  costDown: number;
  twoWay: boolean;
  trips: number;
  activity: string;
  type: string;
  size: string;

}