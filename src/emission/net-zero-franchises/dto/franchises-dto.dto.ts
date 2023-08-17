import { EmissionBaseEntity } from 'src/emission/emission.base.entity';
import { ActivityDataStatus } from 'src/emission/enum/activity-data-status.enum';
import { Project } from 'src/project/entities/project.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { User } from 'src/users/user.entity';

export class FranchisesActivityDataDto {
  month: number;

  year: number;

  method: FranchisesEmissionSourceDataMethod;
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

  specific_method_data: SpecificMethodData;
  not_sub_metered_data: NotSubMeteredData;
  sample_groups_data: SampleGroupsData;
  average_data_method_floor_space_data: AverageDataMethodFloorSpaceData;
  average_data_method_not_floor_space_data: AverageDataMethodNotFloorSpaceData;

}


export class SpecificMethodData {
  data: SpecificMethodParameters[]
  constructor() {
    this.data = []
  }
}

export class NotSubMeteredData {
  data: NotSubMeteredParameters[]
  constructor() {
    this.data = []
  }
}

export class SampleGroupsData {
  data: SampleGroupParameters[]
  constructor() {
    this.data = []
  }
}

export class AverageDataMethodFloorSpaceData {
  data: AverageDataMethodFloorSpaceDataParameters[]
  constructor() {
    this.data = []
  }
}

export class AverageDataMethodNotFloorSpaceData {
  data: AverageDataMethodNotFloorSpaceDataParameters[]
  constructor() {
    this.data = []
  }
}


export class SpecificMethodParameters {
  id: number;
  typeName: string;

  scopeOneEmission: number;
  scopeOneEmission_unit: string;
  scopeTwoEmission: number;
  scopeTwoEmission_unit: string;

  static getResObject(){
    let obj = new SpecificMethodParameters();
    obj.scopeOneEmission = 0;
    obj.scopeOneEmission_unit = '';
    obj.scopeTwoEmission = 0;
    obj.scopeTwoEmission_unit = '';
    return obj;
  }
}

export class NotSubMeteredParameters {
  id: number;
  typeName: string;

  franchises_area: number;
  franchises_area_unit: string;

  building_total_area: number;
  building_total_area_unit: string;

  building_occupancy_rate: number;
  building_occupancy_rate_unit: string;

  building_total_energy_use: number
  building_total_energy_use_unit: string;

  static getResObject():NotSubMeteredParameters{
    let obj = new NotSubMeteredParameters();    
    obj.franchises_area = 0;
    obj.franchises_area_unit= '';
    obj.building_total_area = 0;
    obj.building_total_area_unit= '';
    obj.building_occupancy_rate= 0;
    obj.building_occupancy_rate_unit= '';
    obj.building_total_energy_use= 0
    obj.building_total_energy_use_unit = '';
    return obj;
  }
}

export class SampleGroupParameters {
  id: number;
  typeName: string;

  total_e_of_sampled_franchises: number;
  total_number_of_franchises: number;
  number_of_franchises_sampled: number;

  static getResObject():SampleGroupParameters{
    let obj = new SampleGroupParameters();    
    obj.number_of_franchises_sampled = 0
    obj.total_number_of_franchises = 0
    obj.total_e_of_sampled_franchises = 0
    return obj;
  }
}

export class AverageDataMethodFloorSpaceDataParameters {
  id: number;
  typeName: string;

  building_type_total_floor_space: number;
  building_type_total_floor_space_unit: string;
  building_type_average_emission_factor: number;
  building_type_average_emission_factor_unit: string;
  building_type:string;

  
  static getResObject():AverageDataMethodFloorSpaceDataParameters{
    let obj = new AverageDataMethodFloorSpaceDataParameters();
    obj.building_type_average_emission_factor = 0;
    obj.building_type_average_emission_factor_unit = '';
    obj.building_type_total_floor_space = 0;
    obj.building_type_total_floor_space_unit = '';
    obj.building_type = ''

    return obj;
  }
}

export class AverageDataMethodNotFloorSpaceDataParameters {
  id: number;
  typeName: string;

  number_of_buildings: number;
  average_emissions_of_building: number;
  average_emissions_of_building_unit: string;
  asset_type:string;

  static getResObject(): AverageDataMethodNotFloorSpaceDataParameters{
    let obj = new AverageDataMethodNotFloorSpaceDataParameters();    
    obj.average_emissions_of_building = 0;
    obj.average_emissions_of_building_unit = '';
    obj.number_of_buildings= 0;
    obj.asset_type = ''
    return obj;
  }
}

export enum FranchisesEmissionSourceDataMethod {

  SPECIFIC_METHOD = "SPECIFIC-METHOD",
  NOT_SUB_METERED = "NOT-SUB-METERED",
  SAMPLE_GROUPS = "SAMPLE-GROUPS",
  AVERAGE_DATA_METHOD_FLOOR_SPACE = "AVERAGE-DATA-METHOD-FLOOR-SPACE",
  AVERAGE_DATA_METHOD_NOT_FLOOR_SPACE = "AVERAGE-DATA-METHOD-NOT-FLOOR-SPACE",

}