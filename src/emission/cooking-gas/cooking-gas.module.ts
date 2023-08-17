import { Module } from '@nestjs/common';
import { CookingGasService } from './service/cooking-gas.service';
import { CookingGasActivityDataController } from './controller/cooking-gas.controller';
import { CookingGasActivityData } from './entities/cooking-gas.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
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
    TypeOrmModule.forFeature([CookingGasActivityData, Unit]), 
    HttpModule, 
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [CookingGasActivityDataController],
  providers: [CookingGasService, CalculationService, ParameterUnit, ProgresReportService],
  exports: [CookingGasService]
})
export class CookingGasModule {}
