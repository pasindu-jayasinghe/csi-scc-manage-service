import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationService } from 'src/emission/calculation/calculation.service';
import { EmissionSourceModule } from 'src/emission/emission-source/emission-source.module';
import { EmissionSource } from 'src/emission/emission-source/entities/emission-source.entity';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProjectModule } from 'src/project/project.module';
import { Unit } from 'src/unit/entities/unit.entity';
import { UnitModule } from 'src/unit/unit.module';
import { ParameterUnit } from 'src/utills/parameter-units';
import { Unique } from 'typeorm';
import { BusinessTravelActivityDataController } from './controller/business-travel.controller';
import { BusinessTravelActivityData } from './entities/business-travel.entity';
import { BusinessTravelService } from './service/business-travel.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessTravelActivityData,
      Unit
    ]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [BusinessTravelActivityDataController],
  providers: [BusinessTravelService, CalculationService,ParameterUnit, ProgresReportService],
  exports: [BusinessTravelService]
})
export class BusinessTravelModule {}
