import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { ReportHistory } from './entities/reportHistory.entity';
import { EmissionSourceModule } from 'src/emission/emission-source/emission-source.module';
import { Unit } from 'src/unit/entities/unit.entity';
import { UnitDetails } from 'src/unit/entities/unit-details.entity';
import { Project } from 'src/project/entities/project.entity';
import { Mitigation } from 'src/report-data/mitigation/entities/mitigation.entity';
import { NextStep } from 'src/report-data/next-steps/entities/next-step.entity';
import { Recomendation } from 'src/report-data/recomendation/entities/recomendation.entity';
import { ReportController } from './controller/report.controller';
import { ReportService } from './service/report.service';
import { ReportHistoryService } from './service/reportHistory.service';
import { ReportHistoryController } from './controller/reportHistory.controller';
import { ProjectUnitEmissionSourceService } from 'src/project/service/project-unit-emission-source.service';
import { ProjectModule } from 'src/project/project.module';
import { HttpModule } from '@nestjs/axios';
import { Uncertainty } from './entities/uncertainty.entity';
import { UncertaintyController } from './controller/uncertainty.controller';
import { UncertaintyService } from './service/uncertainty.service';
import { EsDatasource } from 'src/emission/emission-source/entities/es-datasource.entity';
import { EmissionCategory } from 'src/emission/emission-source/entities/emission-category.entity';
import { ProjectEmissionSource } from 'src/emission/emission-source/entities/project-emission-source.entity';
import { EsExcludeReason } from 'src/emission/emission-source/entities/es-exclude-reason.entity';
import { NumEmployee } from 'src/unit/entities/num-employee.entity';
import { UnitModule } from 'src/unit/unit.module';
import { PrevEmission } from 'src/unit/entities/prev-emission.entity';
import { ParameterUnit } from 'src/utills/parameter-units';
import { AuthService } from 'src/auth/service/auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Report,
        ReportHistory,
        Unit,
        UnitDetails,
        Project,
        ProjectEmissionSource,
        Mitigation,
        NextStep,
        Recomendation,
        Uncertainty,
        EsDatasource,
        EmissionCategory,
        EsExcludeReason,
        NumEmployee,
        PrevEmission
      ]
    ), 
    EmissionSourceModule,
    ProjectModule,
    HttpModule,
    UnitModule
    
  ],
  controllers: [ReportController, ReportHistoryController, UncertaintyController],
  providers: [ReportService, ReportHistoryService,UncertaintyService, ParameterUnit, AuthService]
})
export class ReportModule {}
