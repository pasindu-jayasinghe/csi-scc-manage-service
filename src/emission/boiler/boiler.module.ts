import { Module } from '@nestjs/common';
import { BoilerService } from './service/boiler.service';
import { BoilerActivityDataController } from './controller/boiler.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CalculationService } from '../calculation/calculation.service';
import { BoilerActivityData } from './entities/boiler.entity';
import { ProjectModule } from 'src/project/project.module';
import { EmissionSourceModule } from '../emission-source/emission-source.module';
import { ParameterUnit } from 'src/utills/parameter-units';
import { Unit } from 'src/unit/entities/unit.entity';
import { UnitModule } from 'src/unit/unit.module';
import { ProgresReportService } from '../emission-source/service/progres-report.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      BoilerActivityData,
      Unit
    ]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [BoilerActivityDataController],
  providers: [BoilerService, CalculationService,ParameterUnit, ProgresReportService],
  exports:[BoilerService]
})
export class BoilerModule {}
