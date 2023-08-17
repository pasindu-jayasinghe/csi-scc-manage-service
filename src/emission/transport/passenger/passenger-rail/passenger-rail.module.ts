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
import { PassengerRailActivityDataController } from './controller/passenger-rail.controller';
import { PassengerRailActivityData } from './entities/passenger-rail.entity';
import { PassengerRailService } from './service/passenger-rail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PassengerRailActivityData,
      Unit
    ]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [PassengerRailActivityDataController],
  providers: [PassengerRailService, CalculationService, ParameterUnit, ProgresReportService],
  exports: [PassengerRailService]
})
export class PassengerRailModule {}
