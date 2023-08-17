import { Project } from "src/project/entities/project.entity";
import { Unit } from "src/unit/entities/unit.entity";
import { User } from "src/users/user.entity";

export class FuelEnergyRelatedActivitiesActivityDataDto {

 
    month: number;
    year: number;
    activityType: string;

    mobile: boolean;

    stationary: boolean;
  
    user: User;
  
    unit: Unit;
  
    project: Project;
  
    ownership: string;
  
    direct: boolean;
  
    indirect: boolean;
  
    other: boolean;

    groupNo:string
    methodA_data:fuelBsedData[];
    methodB_data:elecBasedData[];
    methodC_data:tanddBasedData[];
    methodD_data:purchsoldBasedData[];

}



export class fuelBsedData {
    
    id:number
    fuelType: string | null;
    consumption:number | null;
    consumption_unit:string;
    user_input_ef:number| null;

  }


  export class elecBasedData {
   
    id:number
    fuelType: string | null;
    consumption:number | null;
    consumption_unit:string
    user_input_ef:number| null;


  }

  export class tanddBasedData {
  
    id:number
    fuelType: string | null;
    consumption:number | null;
    consumption_unit:string
    user_input_ef:number| null;


  }

  export class purchsoldBasedData {

    id:number
    fuelType: string | null;
    consumption:number | null;
    consumption_unit:string
    user_input_ef:number| null;



  }




export enum ActivityType {
    methodA = 'upstream-emissions-of-purchased-fuels',
    methodB ='upstream-emissions-of-purchased-electricity',
    methodC = 'emissions-from-transmission-and-distribution-losses',
    methodD = 'life-cycle-emissions-from-power-hat-is-purchased-and-sold',
  }



