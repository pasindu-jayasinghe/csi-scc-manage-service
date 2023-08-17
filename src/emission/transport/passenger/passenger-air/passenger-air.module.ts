import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationService } from 'src/emission/calculation/calculation.service';
import { EmissionSourceModule } from 'src/emission/emission-source/emission-source.module';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProjectModule } from 'src/project/project.module';
import { Unit } from 'src/unit/entities/unit.entity';
import { UnitModule } from 'src/unit/unit.module';
import { ParameterUnit } from 'src/utills/parameter-units';
import { PassengerAirActivityDataController } from './controller/passenger-air.controller';
import { PassengerAirActivityData } from './entities/passenger-air.entity';
import { PassengerAirService } from './service/passenger-air.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PassengerAirActivityData,
      Unit
    ]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [PassengerAirActivityDataController],
  providers: [PassengerAirService, ParameterUnit, CalculationService, ProgresReportService],
  exports: [PassengerAirService]
})
export class PassengerAirModule {}
