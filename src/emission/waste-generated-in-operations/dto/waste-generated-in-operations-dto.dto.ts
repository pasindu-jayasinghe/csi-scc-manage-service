
  import { EmissionBaseEntity } from 'src/emission/emission.base.entity';
import { ActivityDataStatus } from 'src/emission/enum/activity-data-status.enum';
import { Project } from 'src/project/entities/project.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { User } from 'src/users/user.entity';

export class WasteGeneratedInOperationsActivityDataDto  {
  month: number;

  year: number;

  method:WasteGeneratedInOperationsEmissionSourceDataMethod;
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
  supplier_specific_emission_source_data: SupplierSpecificWasteGeneratedInOperationsEmissionSourceData;
  waste_type_specific_emission_source_data: WasteTypeSpecificWasteGeneratedInOperationsEmissionSourceData;
  average_data_emission_source_data: AverageDataWasteGeneratedInOperationsEmissionSourceData;

}

export class SupplierSpecificWasteGeneratedInOperationsEmissionSourceData {
scope_data:ScopeSupplierSpecificWasteGeneratedInOperationsEmissionSourceData[];


}

export class ScopeSupplierSpecificWasteGeneratedInOperationsEmissionSourceData {
  id:number;
 
 
    company: string;
    scpoeOne: number;
    scpoeOne_unit:string;
    scpoeTwo:number;
    scpoeTwo_unit:string;
  }




 

export class WasteTypeSpecificWasteGeneratedInOperationsEmissionSourceData {

    solid_or_water:WasteGeneratedInOperationsEmissionSourceDataSolidWater
    waste_data:WasteWasteTypeSpecificWasteGeneratedInOperationsEmissionSourceData[];
   
  }


  export class WasteWasteTypeSpecificWasteGeneratedInOperationsEmissionSourceData {
    id:number;
    wasteType: string;
    disposalType: string;
    treatmentMethod:string;
    wasteTypeEF: number;

    wasteProdused: number;
    wasteProdused_unit: string; 
   
    
  }
 
  export class AverageDataWasteGeneratedInOperationsEmissionSourceData {
   
  
    waste_data: WasteAverageDataWasteGeneratedInOperationsEmissionSourceData[];
  }
  export class WasteAverageDataWasteGeneratedInOperationsEmissionSourceData {
    id:number;
    treatmentMethod:string;
    treatmentMethodEF:number
    massOfWaste: number;
    massOfWaste_unit: string;
    proportionOfWaste: number;
   
    
    // user_input_ef:number
  }
  export enum WasteGeneratedInOperationsEmissionSourceDataMethod {
   
    SUPPLIER='supplier-specific',
    WASTE='waste-type-specific',
    AVERAGE_DATA='average-data'
  
   
  }

  export enum WasteGeneratedInOperationsEmissionSourceDataTypeNames {
   
    SCOPE='scope',
    WASTE='waste',
    AVERAGE='average',
    
  
   
  }

  export enum WasteGeneratedInOperationsEmissionSourceDataSolidWater {
   
    SOLID='solid',
    WATER='water',
    
    
  
   
  }
