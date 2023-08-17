import { EmissionBaseEntity } from 'src/emission/emission.base.entity';
import { ActivityDataStatus } from 'src/emission/enum/activity-data-status.enum';
import { Project } from 'src/project/entities/project.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { User } from 'src/users/user.entity';

export class ProcessingOfSoldProductsActivityDataDto {
  month: number;



  
  year: number;

  activityType: ProcessingOfSoldProductsMethod;
  mobile: boolean;

  stationary: boolean;

  user: User;

  unit: Unit;

  project: Project;

  ownership: string;

  direct: boolean;

  indirect: boolean;

  other: boolean;

  activityDataStatus: ActivityDataStatus;
  groupNo: string

  site_specific_method_cO2_data: SiteSpecificMethodCO2Data;
  average_data_method:AverageDataMethodData[];

}

export class SiteSpecificMethodCO2Data {
  fuel_data: FuelBasede_Data[];
  refrigerant_data: RefrigerantBasde_Data[];
  waste_data:WasteBasede_Data[]

}



export class FuelBasede_Data {
  id: number;
  fuel_type: string;
  typeName:string;
; quntity_unit: string;
  quntity: number| null;
  user_input_ef:number| null;
}

export class WasteBasede_Data {
  id: number;
  disposalMethod: string;
  typeName:string;

  waste_type: string;
  mass: number| null;
  mass_unit: string;
}


export class RefrigerantBasde_Data {
  id: number;
  refrigerant_type: string;
  typeName:string;

  quntity: number| null;
  quntity_unit: string;
}




export class AverageDataMethodData {
  id: number;
  sold_intermediate_type: string;
  mass: number|null;
  mass_unit: string;
  user_input_ef:number |null;

}






export enum ProcessingOfSoldProductsMethod {

  SiteSpecificMethodCO2 = 'site_specific_method_cO2',
  AverageDataMethod = 'average_data_method',
 
  


}




