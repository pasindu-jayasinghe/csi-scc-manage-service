import { EmissionBaseEntity } from 'src/emission/emission.base.entity';
import { ActivityDataStatus } from 'src/emission/enum/activity-data-status.enum';
import { Project } from 'src/project/entities/project.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { User } from 'src/users/user.entity';

export class NetZeroBusinessTravelActivityDataDto  {
  month: number;

  year: number;

  method:NetZeroBusinessTravelEmissionSourceDataMethod;
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
  fuel_emission_source_data: FuelBasedNetZeroBusinessTravelEmissionSourceData;
  distance_emission_source_data: DistanceBasedNetZeroBusinessTravelEmissionSourceData;
  spend_emission_source_data: SpendBasedNetZeroBusinessTravelEmissionSourceData;

}

export class FuelBasedNetZeroBusinessTravelEmissionSourceData {
fuel_data:FuelFuelBasedNetZeroBusinessTravelEmissionSourceData[];
grid_data:GridFuelBasedNetZeroBusinessTravelEmissionSourceData[];
refrigerant_data:RefrigerantFuelBasedNetZeroBusinessTravelEmissionSourceData[];

}
export class FuelFuelBasedNetZeroBusinessTravelEmissionSourceData {
  id:number;
  typeName: string;
 
    fuel_type: string;
    fuel_quntity_unit: string;
    quntity:number;
  }
  export class GridFuelBasedNetZeroBusinessTravelEmissionSourceData {
    id:number;
    typeName: string;
 
    grid_type: string;
    grid_quntity_unit: string;
    quntity:number;
  }
  export class RefrigerantFuelBasedNetZeroBusinessTravelEmissionSourceData {
    id:number;
    typeName: string;
 
    refrigerant_type: string;
  
    quntity:number;
    refrigerant_quntity_unit: string;
  }
 

export class DistanceBasedNetZeroBusinessTravelEmissionSourceData {
  
    vehicale_data:VehicleDistanceBasedNetZeroBusinessTravelEmissionSourceData[];
    hotel_data:HotelDistanceBasedNetZeroBusinessTravelEmissionSourceData[];
  }

  export class VehicleDistanceBasedNetZeroBusinessTravelEmissionSourceData {
    id:number;
    typeName: string;
    vehicleType: string;
  
    totalDistanceTravelled: number;
  
    totalDistanceTravelled_unit: string; 
  
    
  }
  export class HotelDistanceBasedNetZeroBusinessTravelEmissionSourceData {
    id:number;
    typeName: string;
    countryCode:string;
    totalNumberHotelNight: number;
    user_input_ef:number  
   
  } 
  export class SpendBasedNetZeroBusinessTravelEmissionSourceData {
   
  
    amount_data: AmountSpendBasedNetZeroBusinessTravelEmissionSourceData[];
  }
  export class AmountSpendBasedNetZeroBusinessTravelEmissionSourceData {
    id:number;
    travel_type:string;
    totalAmountOnTravel: number;
    totalAmountOnTravel_unit: string;
    user_input_ef:number
  }
  export enum NetZeroBusinessTravelEmissionSourceDataMethod {
   
    FUEL_BASE='fuel-base',
    DISTANCE_BASE='distance-base',
    SPEND_BASE='spend-base'
  
   
  }

  export enum NetZeroBusinessTravelEmissionSourceDataTypeNames {
   
    Fuel='Fuel',
    Grid='Grid',
    Ref='Ref',
    Hotel='Hotel',
    Distance='Distance',
  
   
  }
