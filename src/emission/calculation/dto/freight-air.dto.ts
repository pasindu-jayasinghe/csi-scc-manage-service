import { BaseDataDto } from "./emission-base-data.dto";


export class FreightAirDto {
    year:number;
    mode:string;
    distance:DistanceBaseDto;
    baseData: BaseDataDto;
  }


  export class DistanceBaseDto{
    year:number;
    distanceUp: number; //one way and two way up, handle distance from port in userservice
    distanceUp_unit: string; 
    weightUp: number; // one way and two way up
    weightUp_unit: string;
    distanceDown: number; 
    distanceDown_unit: string; 
    weightDown: number;
    weightDown_unit: string;
    costUp: number; // one way and two way up
    costDown: number;
    twoWay: boolean;
    trips: number;

  }