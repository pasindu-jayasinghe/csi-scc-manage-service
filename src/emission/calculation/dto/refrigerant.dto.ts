import { BaseDataDto } from "./emission-base-data.dto";

export class RefrigerantDto {
  year:number;
  countryCode:string;
  W_RG:number;
  GWP_RG: String;
  W_RG_Unit: string


  activityType :string
  assembly_Lf: number;
  annual_lR: number
  time_R: number;
  p_capacity: number
  p_r_recover: number;
  //E_RL: number;
  baseData: BaseDataDto;
}
