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
import { PassengerWaterController } from './controller/passenger-water.controller';
import { PassengerWaterActivityData } from './entities/passenger-water.entity';
import { PassengerWaterService } from './service/passenger-water.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PassengerWaterActivityData,
      Unit
    ]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [PassengerWaterController],
  providers: [PassengerWaterService, CalculationService, ParameterUnit, ProgresReportService],
  exports: [PassengerWaterService]
})
export class PassengerWaterModule {}
