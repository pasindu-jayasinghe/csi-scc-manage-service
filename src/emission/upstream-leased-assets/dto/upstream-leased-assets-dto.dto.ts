import { EmissionBaseEntity } from 'src/emission/emission.base.entity';
import { ActivityDataStatus } from 'src/emission/enum/activity-data-status.enum';
import { Project } from 'src/project/entities/project.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { User } from 'src/users/user.entity';

export class UpstreamLeasedAssetsActivityDataDto {
  month: number;

  year: number;

  activityType: UpstreamLeasedAssetDataMethod;
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

  asset_specific_method_data: AssetSpecificMethodData;
  lessor_specific_method_data: LessorSpecificMethodData[];
  leased_buildings_method_data: LeasedBuildingsMethodData[];
  leased_assets_method_data: LeasedAssetsMethodData[];

}

export class AssetSpecificMethodData {
  fuel_data: FuelBasedeData[];
  refrigerant_data: RefrigerantBasdeData[];
  elec_data:ElectricityBaseData[];

}
export class FuelBasedeData {
  id: number;
  fuel_type: string;
  fuel_quntity_unit: string;
  fuel_quntity: number| null;
  typeName: string | null ;
}


export class ElectricityBaseData {
  id: number;
  fuel_type: string;
  fuel_quntity_unit: string;
  fuel_quntity: number| null;
  typeName: string | null ;
}
export class RefrigerantBasdeData {
  id: number;
  refrigerant_type: string;
  refrigerant_quntity: number| null
  refrigerant_quntity_unit: string;
  process_emission:number| null
  process_emission_unit:string
  typeName: string | null ;

}

export class LessorSpecificMethodData {
  id: number;
  lessorType:string;
  userInputEF:number| null;
  scp1scp2_emissions_lessor: number| null;
  scp1scp2_emissions_lessor_unit: string;
  lease_assests_ratio:number| null;
}

export class LeasedBuildingsMethodData {
  id: number;
  userInputEF:number| null
  total_floor_space: number| null
  total_floor_space_unit: string;
  building_type: string;
}

export class LeasedAssetsMethodData {
  userInputEF:number| null
  number_of_assets: number| null
  asset_type: string;
  id:number;
}


export enum UpstreamLeasedAssetDataMethod {

  FuelAssetSpecificMethod = 'fuel_asset_specific_method_data',
  DistanceLessorSpecificMethod = 'distance_lessor_specific_method_data',
  SpendLeasedBuildingsMethod = 'spend_leased_buildings_method_data',
  LeasedAssetsMethod = 'leased_assets_method_data'
  


}




