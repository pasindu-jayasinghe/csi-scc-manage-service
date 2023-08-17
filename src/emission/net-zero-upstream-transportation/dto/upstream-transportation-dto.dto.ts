import { ActivityDataStatus } from 'src/emission/enum/activity-data-status.enum';
import { Project } from 'src/project/entities/project.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { User } from 'src/users/user.entity';

export enum UpstreamTransportationEmissionSourceDataMethod {
  FUEL_BASE_METHOD="FUEL-BASE-METHOD",
  DISTANCE_BASE_METHOD="DISTANCE-BASE-METHOD",
  SPEND_BASE_METHOD="SPEND-BASE-METHOD",
  SITE_SPECIFIC_METHOD = "SITE-SPECIFIC-METHOD",
  AVERAGE_DATA_METHOD = "AVERAGE-DATA-METHOD",
}


export enum UpstreamTransportationFuelBaseType {
  FUEL_DATA = "FUEL_DATA",
  ELECTRICITY_DATA = "ELECTRICITY_DATA",
  REFRIGENT_DATA = "REFRIGENT_DATA",
  BACKHAUL_DATA = "BACKHAUL_DATA",
}

export class UpstreamTransportationActivityDataDto {
  month: number;

  year: number;

  method: UpstreamTransportationEmissionSourceDataMethod;
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

  fule_based_method_data: FuelBaseMethodData;
  distance_based_method_data: DistanceBaseMethodData;
  spend_based_method_data: SpendBaseMethodData;
  site_specific_method_data: SiteSpecificMethodData;
  average_data_method_data: DTAverageDataMethodData;

}


export class FuelBaseMethodData {
  fuel_data: FuelParameters[];
  electricity_data: ElectricityParameters[];
  refrigerent_data: RefrigerentParameters[];
  backhaul_data: BackhaulParameters[];
  constructor() {
    this.fuel_data = [];
    this.electricity_data = [];
    this.refrigerent_data = [];
    this.backhaul_data = [];
  }
}

export class DistanceBaseMethodData {
  data: DistanceBaseMethodDataParameters[]
  constructor() {
    this.data = []
  }
}

export class SpendBaseMethodData {
  data: SpendBaseMethodDataParameters[]
  constructor() {
    this.data = []
  }
}

export class SiteSpecificMethodData {
  data: SiteSpecificMethodParameters[]
  constructor() {
    this.data = []
  }
}

export class DTAverageDataMethodData {
  data: DTAverageDataMethodDataParameters[]
  constructor() {
    this.data = []
  }
}

export class FuelParameters{
  id: number;
  typeName: string;
  quantity_of_fuel_consumed: number;
  quantity_of_fuel_consumed_unit: string;
  fuelBasefuelType: string;

  static getResObject(){
    let obj = new FuelParameters();    
    obj.quantity_of_fuel_consumed= 0;
    obj.quantity_of_fuel_consumed_unit = '';
    obj.fuelBasefuelType = '';
    return obj;
  }
}

export class ElectricityParameters{
  id: number;
  typeName: string;
  quantity_of_electricity_consumed: number;
  quantity_of_electricity_consumed_unit: string;
  grid_region:string;

  static getResObject(){
    let obj = new ElectricityParameters();    
    obj.quantity_of_electricity_consumed= 0;
    obj.quantity_of_electricity_consumed_unit = '';
    obj.grid_region = '';
    return obj;
  }
}

export class RefrigerentParameters{
  id: number;
  typeName: string;
  quantity_of_refrigerent_leaked: number;
  quantity_of_refrigerent_leaked_unit: string;
  fuelBaseRefrigerantType: string
  static getResObject(){
    let obj = new RefrigerentParameters();    
    obj.quantity_of_refrigerent_leaked= 0;
    obj.quantity_of_refrigerent_leaked_unit = '';
    obj.fuelBaseRefrigerantType = '';
    return obj;
  }
}


export class BackhaulParameters{
  id: number;
  typeName: string;
  quantity_of_fuel_consumed_from_backhaul: number;
  quantity_of_fuel_consumed_from_backhaul_unit: string;
  fuelBaseBackhaulFuelType: string;
  
  static getResObject(){
    let obj = new BackhaulParameters();    
    obj.quantity_of_fuel_consumed_from_backhaul= 0;
    obj.quantity_of_fuel_consumed_from_backhaul_unit = '';
    obj.fuelBaseBackhaulFuelType = '';
    return obj;
  }
}

export class DistanceBaseMethodDataParameters{
  id: number;
  typeName: string;

  mass_of_goods_purchased: number;
  mass_of_goods_purchased_unit: string;
  distance_travelled_in_transport_leg: number;
  distance_travelled_in_transport_leg_unit: string;
  vehicle_type: string;

  static getResObject(){
    let obj = new DistanceBaseMethodDataParameters();
    obj.mass_of_goods_purchased = 0;
    obj.mass_of_goods_purchased_unit= '';
    obj.distance_travelled_in_transport_leg= 0;
    obj.distance_travelled_in_transport_leg_unit= '';
    obj.vehicle_type = '';
    return obj;
  }
}

export class SpendBaseMethodDataParameters{
  id: number;
  typeName: string;

  amount_spent_on_transportation_by_type: number;
  amount_spent_on_transportation_by_type_unit: string;
  shareOfTotalProjectCosts: number;
  shareOfTotalProjectCosts_unit: string;
  eEIO_factor: number;
  eEIO_factor_unit: string;

  static getResObject(){
    let obj = new SpendBaseMethodDataParameters();
    obj.amount_spent_on_transportation_by_type = 0;
    obj.amount_spent_on_transportation_by_type_unit = '';
    obj.shareOfTotalProjectCosts= 0;
    obj.shareOfTotalProjectCosts_unit = '';
    obj.eEIO_factor= 0;
    obj.eEIO_factor_unit = '';
    return obj;
  }
}

export class SiteSpecificMethodParameters {
  id: number;
  typeName: string;

  volume_of_reporting_companys_purchased_goods: number;
  volume_of_reporting_companys_purchased_goods_unit: string;
  total_volume_of_goods_in_storage_facility: number;
  total_volume_of_goods_in_storage_facility_unit: string;
  fuel_consumed: number
  fuel_consumed_unit: string;
  electricity_consumed: number;
  electricity_consumed_unit: string;
  refrigerant_leakage: number;
  refrigerant_leakage_unit: string;

  refrigerantType: string;
  fuelType: string;

  static getResObject(){
    let obj = new SiteSpecificMethodParameters();
    obj.volume_of_reporting_companys_purchased_goods = 0;
    obj.volume_of_reporting_companys_purchased_goods_unit = '';;
    obj.total_volume_of_goods_in_storage_facility= 0;
    obj.total_volume_of_goods_in_storage_facility_unit = '';;
    obj.fuel_consumed= 0;
    obj.fuel_consumed_unit = '';;
    obj.electricity_consumed= 0;
    obj.electricity_consumed_unit = '';;
    obj.refrigerant_leakage= 0;
    obj.refrigerant_leakage_unit = '';
    return obj;
  }
}

export class DTAverageDataMethodDataParameters {
  id: number;
  typeName: string;

  average_number_of_days_stored: number;
  storage_facility_ef: number;
  storage_facility_ef_unit: string;
  volume_of_stored_goods: number;
  volume_of_stored_goods_unit: string;

  static getResObject(): DTAverageDataMethodDataParameters{
    let obj = new DTAverageDataMethodDataParameters(); 
    obj.average_number_of_days_stored = 0;   
    obj.storage_facility_ef = 0;   
    obj.storage_facility_ef_unit = '';   
    obj.volume_of_stored_goods = 0;   
    obj.volume_of_stored_goods_unit = '';   
    return obj;
  }
}

