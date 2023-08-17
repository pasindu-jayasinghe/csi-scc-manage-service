import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationService } from 'src/emission/calculation/calculation.service';
import { EmissionSourceModule } from 'src/emission/emission-source/emission-source.module';
import { EmissionSource } from 'src/emission/emission-source/entities/emission-source.entity';
import { ProgresReportService } from 'src/emission/emission-source/service/progres-report.service';
import { ProjectUnitEmissionSource } from 'src/project/entities/project-unit-emission-source.entity';
import { ProjectUnit } from 'src/project/entities/project-unit.entity';
import { ProjectModule } from 'src/project/project.module';
import { Unit } from 'src/unit/entities/unit.entity';
import { UnitModule } from 'src/unit/unit.module';
import { ParameterUnit } from 'src/utills/parameter-units';
import { PassengerOffroadActivityDataController } from './controller/passenger-offroad.controller';
import { PassengerOffroadActivityData } from './entities/passenger-offroad.entity';
import { PassengerOffroadService } from './service/passenger-offroad.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PassengerOffroadActivityData,
      ProjectUnitEmissionSource,
      EmissionSource,
      ProjectUnit,
      Unit
    ]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [PassengerOffroadActivityDataController],
  providers: [
    PassengerOffroadService, 
    CalculationService,
    ParameterUnit,
    ProgresReportService
  ],
  exports: [PassengerOffroadService]
})
export class PassengerOffroadModule {}
