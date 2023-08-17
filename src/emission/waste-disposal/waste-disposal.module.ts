import { Module } from '@nestjs/common';
import { WasteDisposalService } from './service/waste-disposal.service';
import { WasteDisposalActivityDataController } from './controller/waste-disposal.controller';
import { WasteDisposalActivityData } from './entities/waste-disposal.entity';
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
    TypeOrmModule.forFeature([
      WasteDisposalActivityData,
      Unit
    ]), 
    HttpModule,
    ProjectModule,
    EmissionSourceModule,
    UnitModule
  ],
  controllers: [WasteDisposalActivityDataController],
  providers: [WasteDisposalService, CalculationService,ParameterUnit, ProgresReportService],
  exports:[WasteDisposalService]
})
export class WasteDisposalModule {}
