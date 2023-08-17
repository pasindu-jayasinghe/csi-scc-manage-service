import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculationService } from '../calculation/calculation.service';
import { GeneratorActivityData } from './entities/generator.entity';
import { GeneratorActivityDataController } from './controller/generator.controller';
import { GeneratorService } from './service/generator.service';
import { ProjectModule } from 'src/project/project.module';
import { EmissionSourceModule } from '../emission-source/emission-source.module';
import { ProjectEmissionFactorService } from 'src/project/service/project-emission-factor.service';
import { ParameterUnit } from 'src/utills/parameter-units';
import { ProgresReportService } from '../emission-source/service/progres-report.service';
import { UnitModule } from 'src/unit/unit.module';
import { Unit } from 'src/unit/entities/unit.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GeneratorActivityData,
      Unit
    ]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],

  controllers: [GeneratorActivityDataController],
  providers: [GeneratorService,CalculationService,ParameterUnit, ProgresReportService],
  exports: [GeneratorService]
})
export class GeneratorModule {}
