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
import { FreightOffroadActivityDataController } from './controller/freight-offroad.controller';
import { FreightOffroadActivityData } from './entities/freight-offroad.entity';
import { FreightOffroadService } from './service/freight-offroad.service';

@Module({
  imports: [
    TypeOrmModule
      .forFeature([FreightOffroadActivityData, Unit]),
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [FreightOffroadActivityDataController],
  providers: [FreightOffroadService, CalculationService, ParameterUnit, ProgresReportService],
  exports: [FreightOffroadService]
})
export class FreightOffroadModule {}
