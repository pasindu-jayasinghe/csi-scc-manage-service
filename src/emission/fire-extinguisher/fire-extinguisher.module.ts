import {Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FireExtinguisherService } from './service/fire-extinguisher.service';
import { FireExtinguisherActivityDataController } from './controller/fire-extinguisher.controller';
import { FireExtinguisherActivityData } from './entities/fire-extinguisher.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationService } from '../calculation/calculation.service';
import { ProjectModule } from 'src/project/project.module';
import { EmissionSourceModule } from '../emission-source/emission-source.module';
import { ParameterUnit } from 'src/utills/parameter-units';
import { UnitModule } from 'src/unit/unit.module';
import { Unit } from 'src/unit/entities/unit.entity';
import { ProgresReportService } from '../emission-source/service/progres-report.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FireExtinguisherActivityData,
      Unit
    ]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [FireExtinguisherActivityDataController],
  providers: [FireExtinguisherService,CalculationService, ParameterUnit, ProgresReportService],
  exports: [FireExtinguisherService]
})
export class FireExtinguisherModule {}
