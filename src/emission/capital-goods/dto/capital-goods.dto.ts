import { Project } from "src/project/entities/project.entity";
import { Unit } from "src/unit/entities/unit.entity";
import { User } from "src/users/user.entity";

export class CapitalGoodsActivityDataDto
 {

 
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

    method_data:cgBasedData[];
  

}


export class cgBasedData {
    id:number
    type_of_cg: string;
    category:string;
    quantity:number| null;
    user_input_ef:number | null;
    user_input_ef_unit: string;
    quantity_unit:string;
  }


  
  



