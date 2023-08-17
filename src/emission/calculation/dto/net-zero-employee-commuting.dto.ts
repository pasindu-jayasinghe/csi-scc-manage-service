import {EmployeeAverageDataNetZeroEmployeeCommutingEmissionSourceData, EnergyDistanceBasedNetZeroEmployeeCommutingEmissionSourceData, FuelFuelBasedNetZeroEmployeeCommutingEmissionSourceData, GridFuelBasedNetZeroEmployeeCommutingEmissionSourceData, RefrigerantFuelBasedNetZeroEmployeeCommutingEmissionSourceData, VehicleDistanceBasedNetZeroEmployeeCommutingEmissionSourceData } from "src/emission/net-zero-employee-commuting/dto/net-zero-employee-commuting-dto.dto";
import { BaseDataDto } from "./emission-base-data.dto";

export class NetZeroEmployeeCommutingDto{
    
    month: number;

   
    year: number;

   
    method: string;

    data:VehicleDistanceBasedNetZeroEmployeeCommutingEmissionSourceData | EnergyDistanceBasedNetZeroEmployeeCommutingEmissionSourceData|EmployeeAverageDataNetZeroEmployeeCommutingEmissionSourceData|FuelFuelBasedNetZeroEmployeeCommutingEmissionSourceData|GridFuelBasedNetZeroEmployeeCommutingEmissionSourceData|RefrigerantFuelBasedNetZeroEmployeeCommutingEmissionSourceData;


    groupNumber:string;
    emission: number;

    baseData: BaseDataDto;  
}