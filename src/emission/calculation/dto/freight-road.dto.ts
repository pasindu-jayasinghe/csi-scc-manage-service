import { BaseDataDto } from "./emission-base-data.dto";


export class FreightRoadDto {
  year:number;
  month: number;
  mode:string;
  fuelType: string;
  fuel:FuelBaseDto;
  distance:DistanceBaseDto;
  share: number;
  baseData: BaseDataDto

}

export class FuelBaseDto{
  fc: number;
  fc_unit: string;
}

export class DistanceBaseDto{
  distanceUp: number; //one way and two way up and for shared types
  distanceUp_unit: string; 
  weightUp: number; // one way and two way up
  weightUp_unit: string;
  distanceDown: number; 
  distanceDown_unit: string; 
  weightDown: number;
  weightDown_unit: string;
  costUp: number; // one way and two way up
  costDown: number;
  cargoType: string;
  twoWay: boolean;
  trips: number;
  fe: number;
  fe_unit: string;

}