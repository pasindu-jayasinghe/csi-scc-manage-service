import { BaseDataDto } from "./emission-base-data.dto";

export class FreightRailDto {
  year:number;
  month: number;
  mode:string;
  fuelType: string;
  fuel:FuelBaseDto;
  distance:DistanceBasedDto;
  baseData: BaseDataDto

}

export class FuelBaseDto{
  fuelType:string;
  fc:number;
  fc_unit:string;
}

export class DistanceBasedDto{
  activity: string
  type: string
  distanceUp: number //one way and two way up
  distanceUp_unit: string
  weightUp: number //one way and two way up
  weightUp_unit: string
  distanceDown: number //one way and two way up
  distanceDown_unit: string
  weightDown: number //one way and two way up
  weightDown_unit: string
  twoWay: boolean;
  trips: number;
}