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
import { OffroadMachineryOffroadActivityDataController } from './controller/offroad-machinery-offroad.controller';
import { OffroadMachineryOffroadActivityData } from './entities/offroad-machinery-offroad.entity';
import { OffroadMachineryOffroadService } from './service/offroad-machinery-offroad.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OffroadMachineryOffroadActivityData,
      Unit
    ]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [OffroadMachineryOffroadActivityDataController],
  providers: [OffroadMachineryOffroadService, CalculationService, ParameterUnit, ProgresReportService],
  exports: [OffroadMachineryOffroadService]
})
export class OffroadMachineryOffroadModule {}
