import { EmissionBaseEntity } from 'src/emission/emission.base.entity';
import { ActivityDataStatus } from 'src/emission/enum/activity-data-status.enum';
import { Project } from 'src/project/entities/project.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { User } from 'src/users/user.entity';

export class NetZeroEmployeeCommutingActivityDataDto {
  month: number;

  year: number;

  method: NetZeroEmployeeCommutingEmissionSourceDataMethod;
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
  fuel_emission_source_data: FuelBasedNetZeroEmployeeCommutingEmissionSourceData;
  distance_emission_source_data: DistanceBasedNetZeroEmployeeCommutingEmissionSourceData;
  average_data_emission_source_data: AverageDataNetZeroEmployeeCommutingEmissionSourceData;

}

export class FuelBasedNetZeroEmployeeCommutingEmissionSourceData {
  fuel_data: FuelFuelBasedNetZeroEmployeeCommutingEmissionSourceData[];
  grid_data: GridFuelBasedNetZeroEmployeeCommutingEmissionSourceData[];
  refrigerant_data: RefrigerantFuelBasedNetZeroEmployeeCommutingEmissionSourceData[];

}

export class FuelFuelBasedNetZeroEmployeeCommutingEmissionSourceData {
  id: number;
  typeName: string;

  fuel_type: string;
  fuel_quntity_unit: string;
  quntity: number;
}

export class GridFuelBasedNetZeroEmployeeCommutingEmissionSourceData {
  id: number;
  typeName: string;

  grid_type: string;
  grid_quntity_unit: string;
  quntity: number;
}

export class RefrigerantFuelBasedNetZeroEmployeeCommutingEmissionSourceData {
  id: number;
  typeName: string;

  refrigerant_type: string;

  quntity: number;
  refrigerant_quntity_unit: string;
}


export class DistanceBasedNetZeroEmployeeCommutingEmissionSourceData {

  vehicale_data: VehicleDistanceBasedNetZeroEmployeeCommutingEmissionSourceData[];
  energy_data: EnergyDistanceBasedNetZeroEmployeeCommutingEmissionSourceData[];
}


export class VehicleDistanceBasedNetZeroEmployeeCommutingEmissionSourceData {
  id: number;
  typeName: string;
  vehicleType: string;

  totalDistanceTravelled: number;

  totalDistanceTravelled_unit: string;
  commutingDaysPerYear: number;

}
export class EnergyDistanceBasedNetZeroEmployeeCommutingEmissionSourceData {
  id: number;
  typeName: string;
  energy_source: string;
  energy: number;
  energy_unit: string;
  user_input_ef: number

}
export class AverageDataNetZeroEmployeeCommutingEmissionSourceData {


  average_data: EmployeeAverageDataNetZeroEmployeeCommutingEmissionSourceData[];
}
export class EmployeeAverageDataNetZeroEmployeeCommutingEmissionSourceData {
  id: number;
  travel_type: string;
  workingDayPerYear: number;
  oneWayDistance: number;
  oneWayDistance_unit: string;
  numberOfEmplyees: number;
  presentageUsingVehcleType: number;
  // user_input_ef:number
}
export enum NetZeroEmployeeCommutingEmissionSourceDataMethod {

  FUEL_BASE = 'fuel-base',
  DISTANCE_BASE = 'distance-base',
  AVERAGE_DATA_BASE = 'average-data-base'


}

export enum NetZeroEmployeeCommutingEmissionSourceDataTypeNames {

  Fuel = 'Fuel',
  Grid = 'Grid',
  Ref = 'Ref',
  Energy = 'Energy',
  Distance = 'Distance',
  Employee = 'Employee',


}
