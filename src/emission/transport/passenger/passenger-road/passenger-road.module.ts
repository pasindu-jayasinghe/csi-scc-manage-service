import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationService } from 'src/emission/calculation/calculation.service';
import { EmissionSourceModule } from 'src/emission/emission-source/emission-source.module';
import { EmissionSource } from 'src/emission/emission-source/entities/emission-source.entity';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProjectModule } from 'src/project/project.module';
import { NumEmployee } from 'src/unit/entities/num-employee.entity';
import { UnitDetails } from 'src/unit/entities/unit-details.entity';
import { Unit } from 'src/unit/entities/unit.entity';
import { UnitModule } from 'src/unit/unit.module';
import { ParameterUnit } from 'src/utills/parameter-units';
import { EmployeeNameController } from './controller/employee-names.controller';
import { PassengerRoadActivityDataController } from './controller/passenger-road.controller';
import { EmployeeName } from './entities/employee-names.entity';
import { PassengerRoadActivityData } from './entities/passenger-road.entity';
import { EmployeeNameService } from './service/employee-names.service';
import { PassengerRoadService } from './service/passenger-road.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PassengerRoadActivityData,
      EmployeeName,
      Unit,
      UnitDetails,
      NumEmployee
    ]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [PassengerRoadActivityDataController,EmployeeNameController],
  providers: [PassengerRoadService, CalculationService,ParameterUnit,EmployeeNameService, ProgresReportService],
  exports: [PassengerRoadService,EmployeeNameService]
})
export class PassengerRoadModule {}
