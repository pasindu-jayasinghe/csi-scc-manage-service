import { Project } from "src/project/entities/project.entity";
import { Unit } from "src/unit/entities/unit.entity";
import { User } from "src/users/user.entity";

export class EndOfLifeTreatmentOfSoldProductsActivityDataDto {

 
    month: number;
    year: number;


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

    method_data:wasteBasedData[];
  

}





export class wasteBasedData {
    
    id:number
    wasteMethod: string;
    soldProducts:number| null;
    totalWaste:number| null;
    mass_unit:string
  }


  
  





// export enum ActivityType {
//     methodA = 'investment-specific-method-equity-investments',
//     methodB = 'average-data-method-equity-investments',
//     methodC = 'project-specific-method-project-finance-and-debt-investments',
//     methodD = 'average-data-method-project-finance-and-debt-investments',
//     methodE = 'projected-total-lifetime-emissions-project-finance-and-debt-investments',
//   }