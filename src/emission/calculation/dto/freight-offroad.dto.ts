import { BaseDataDto } from "./emission-base-data.dto";

export class FreightOffRoadDto {
  year:number;
  month:number;
  mode:string;
  fuel:FuelBaseDto;
  distance:DistanceBaseDto;
  industry: string;
  baseData: BaseDataDto
}

export class FuelBaseDto{
  fc: number;
  fc_unit: string;
  stroke: string;
  fuelType: string;
}

export class DistanceBaseDto{


}