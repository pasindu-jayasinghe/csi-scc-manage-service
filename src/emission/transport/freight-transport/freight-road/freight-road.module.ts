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
import { FreightRoadActivityDataController } from './controller/freight-road.controller';
import { FreightRoadActivityData } from './entities/freight-road.entity';
import { FreightRoadService } from './service/freight-road.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([FreightRoadActivityData, Unit]),
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [FreightRoadActivityDataController],
  providers: [FreightRoadService, CalculationService,ParameterUnit, ProgresReportService],
  exports:[FreightRoadService]
})
export class FreightRoadModule {}
