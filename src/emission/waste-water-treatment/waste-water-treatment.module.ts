import { Module } from '@nestjs/common';
import { WasteWaterTreatmentService } from './service/waste-water-treatment.service';

import { WasteWaterTreatmentActivityDataController } from './controller/waste-water-treatment.controller';
import { CalculationService } from '../calculation/calculation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { WasteWaterTreatmentActivityData } from './entities/waste-water-treatment.entity';
import { ProjectModule } from 'src/project/project.module';
import { EmissionSourceModule } from '../emission-source/emission-source.module';
import { ParameterUnit } from 'src/utills/parameter-units';
import { Unit } from 'src/unit/entities/unit.entity';
import { UnitModule } from 'src/unit/unit.module';
import { ProgresReportService } from '../emission-source/service/progres-report.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WasteWaterTreatmentActivityData, Unit]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [WasteWaterTreatmentActivityDataController],
  providers: [WasteWaterTreatmentService, CalculationService, ParameterUnit, ProgresReportService],
  exports: [WasteWaterTreatmentService]
})
export class WasteWaterTreatmentModule {}
