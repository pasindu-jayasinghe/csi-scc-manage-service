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
import { FreightRailActivityDataController} from './controller/freight-rail.controller';
import { FreightRailActivityData } from './entities/freight-rail.entity';
import { FreightRailService } from './service/freight-rail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FreightRailActivityData, Unit]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [FreightRailActivityDataController],
  providers: [FreightRailService, CalculationService,ParameterUnit, ProgresReportService],
  exports:[FreightRailService]

})
export class FreightRailModule {}
