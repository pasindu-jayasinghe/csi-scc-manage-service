
  import { EmissionBaseEntity } from 'src/emission/emission.base.entity';
import { ActivityDataStatus } from 'src/emission/enum/activity-data-status.enum';
import { Project } from 'src/project/entities/project.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { User } from 'src/users/user.entity';

export class DownstreamLeasedAssetsActivityDataDto  {
  month: number;

  year: number;

  method:DownstreamLeasedAssetsEmissionSourceDataMethod;
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
  asset_specific_method_data: AssetSpecificDownstreamLeasedAssetsEmissionSourceData;
  lessor_specific_method_data: LessorSpecificDownstreamLeasedAssetsEmissionSourceData;
  leased_buildings_method_data: LeasedBuildingsDownstreamLeasedAssetsEmissionSourceData;
  leased_assets_method_data: LeasedAssetsDownstreamLeasedAssetsEmissionSourceData;

}

export class AssetSpecificDownstreamLeasedAssetsEmissionSourceData {
  fuel_data: FuelBaseAssetSpecificDownstreamLeasedAssetsEmissionSourceData[];
  refrigerant_data: RefrigerantAssetSpecificDownstreamLeasedAssetsEmissionSourceData[];

}

export class FuelBaseAssetSpecificDownstreamLeasedAssetsEmissionSourceData {
  id: number;
  fuel_type: string;
  fuel_quntity_unit: string;
  fuel_quntity: number;
}

export class RefrigerantAssetSpecificDownstreamLeasedAssetsEmissionSourceData {
  id: number;
  refrigerant_type: string;
  refrigerant_quntity: number;
  refrigerant_quntity_unit: string;
  process_emission:number;
  process_emission_unit:string;

}

export class LessorSpecificDownstreamLeasedAssetsEmissionSourceData {
  lessor_data: LessorDataLessorSpecificDownstreamLeasedAssetsEmissionSourceData[];
 

}

export class LessorDataLessorSpecificDownstreamLeasedAssetsEmissionSourceData {
  id: number;
  user_input_ef:number;
  lessor_type:string;
  scp1scp2_emissions_lessor: number;
  scp1scp2_emissions_lessor_unit: string;
  lease_assests_ratio:number
}



export class LeasedBuildingsDownstreamLeasedAssetsEmissionSourceData {
  leased_data: leasedDataLeasedBuildingsDownstreamLeasedAssetsEmissionSourceData[];
  

}

export class leasedDataLeasedBuildingsDownstreamLeasedAssetsEmissionSourceData {
  id: number;
  user_input_ef:number;
  total_floor_space: number;
  total_floor_space_unit: string;
  building_type: string;
}

export class LeasedAssetsDownstreamLeasedAssetsEmissionSourceData {
  leased_data: leasedDataLeasedAssetsDownstreamLeasedAssetsEmissionSourceData[];
  

}

export class leasedDataLeasedAssetsDownstreamLeasedAssetsEmissionSourceData {
  user_input_ef:number;
  number_of_assets: number;
  asset_type: string;
  id:number;
}


export enum DownstreamLeasedAssetsEmissionSourceDataMethod {

  AssetSpecificMethod = 'asset_specific_method_data',
  LessorSpecificMethod = 'lessor_specific_method_data',
  LeasedBuildingsMethod = 'leased_buildings_method_data',
  LeasedAssetsMethod = 'leased_assets_method_data'
  


}


export enum DownstreamLeasedAssetsEmissionSourceDataTypeNames {
   
  Fuel='Fuel',
  Ref='Ref',
  

 
}

