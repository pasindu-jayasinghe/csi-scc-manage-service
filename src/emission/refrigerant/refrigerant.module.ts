import { Module } from '@nestjs/common';
import { RefrigerantService } from './service/refrigerant.service';
import { RefrigerantActivityDataController } from './controller/refrigerant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefrigerantActivityData } from './entities/refrigerant.entity';
import { HttpModule } from '@nestjs/axios';
import { CalculationService } from '../calculation/calculation.service';
import { ProjectModule } from 'src/project/project.module';
import { EmissionSourceModule } from '../emission-source/emission-source.module';
import { ParameterUnit } from 'src/utills/parameter-units';
import { Unit } from 'src/unit/entities/unit.entity';
import { UnitModule } from 'src/unit/unit.module';
import { ProgresReportService } from '../emission-source/service/progres-report.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RefrigerantActivityData,
      Unit
    ]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [RefrigerantActivityDataController],
  providers: [RefrigerantService, CalculationService,ParameterUnit, ProgresReportService],
  exports:[RefrigerantService]
})
export class RefrigerantModule {}




