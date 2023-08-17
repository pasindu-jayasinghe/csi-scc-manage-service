import { Module } from '@nestjs/common';
import { WeldingEsService } from './service/welding-es.service';
import { WeldingEsActivityDataController } from './controller/welding-es.controller';
import { CalculationService } from '../calculation/calculation.service';
import { WeldingEsActivityData } from './entities/welding-es.entity';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectModule } from 'src/project/project.module';
import { EmissionSourceModule } from '../emission-source/emission-source.module';
import { ParameterUnit } from 'src/utills/parameter-units';
import { Unit } from 'src/unit/entities/unit.entity';
import { UnitModule } from 'src/unit/unit.module';
import { ProgresReportService } from '../emission-source/service/progres-report.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WeldingEsActivityData, Unit]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [WeldingEsActivityDataController],
  providers: [WeldingEsService, CalculationService,ParameterUnit, ProgresReportService],
  exports: [WeldingEsService]

})
export class WeldingEsModule {}
