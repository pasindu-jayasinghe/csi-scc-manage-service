import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationService } from '../calculation/calculation.service';
import { ProjectModule } from 'src/project/project.module';
import { EmissionSourceModule } from '../emission-source/emission-source.module';
import { ProjectEmissionFactorService } from 'src/project/service/project-emission-factor.service';
import { ParameterUnit } from 'src/utills/parameter-units';
import { ProgresReportService } from '../emission-source/service/progres-report.service';
import { UnitModule } from 'src/unit/unit.module';
import { Unit } from 'src/unit/entities/unit.entity';
import { FuelEnergyRelatedActivitiesActivityData } from './entities/fuel_energy_related_activities.entity';
import { FuelEnergyRelatedActivitiesActivityDataController } from './controller/fuel_energy_related_activities.controller';
import { FuelEnergyRelatedActivitiesService } from './service/fuel_energy_related_activities.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FuelEnergyRelatedActivitiesActivityData,
      Unit
    ]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],

  controllers: [FuelEnergyRelatedActivitiesActivityDataController],
  providers: [FuelEnergyRelatedActivitiesService,CalculationService,ParameterUnit, ProgresReportService],
  exports: [FuelEnergyRelatedActivitiesService]
})
export class FuelEnergyRelatedActivitiesModule {}
