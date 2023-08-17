import { Module } from '@nestjs/common';
import { EmissionSourceService } from './service/emission-source.service';
import { EmissionSourceController } from './controller/emission-source.controller';
import { EmissionSource } from './entities/emission-source.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEmissionSourceService } from './service/project-emission-source.service';
import { ProjectEmissionSource } from './entities/project-emission-source.entity';
import { forwardRef } from '@nestjs/common';
import { ProjectModule } from 'src/project/project.module';
import { ProjectEmissionSourceController } from './controller/project-emission-source.controller';
import { EsDatasource } from './entities/es-datasource.entity';
import { EsDatasourceController } from './controller/es-datasource.controller';
import { EsDatasourceService } from './service/es-datasource.service';
import { EsExcludeReason } from './entities/es-exclude-reason.entity';
import { EsExcludeReasonController } from './controller/es-exclude-reason.controller';
import { EsExcludeReasonService } from './service/es-exclude-reason.service';
import { HttpModule } from '@nestjs/axios';
import { Project } from 'src/project/entities/project.entity';
import { EmissionCategory } from './entities/emission-category.entity';
import { EmissionCategoryService } from './service/emission-category.service';
import { EmissionCategoryController } from './controller/emission-category.controller';
import { UnitModule } from 'src/unit/unit.module';
import { EmissionSourceRecalService } from './service/emission-source-recal.service';
import { EmissionSourceBulkService } from './service/emission-source-bulk.service';
import { ProgresReportService } from './service/progres-report.service';
import { ParameterUnit } from 'src/utills/parameter-units';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [EmissionSource, ProjectEmissionSource, EsDatasource, EsExcludeReason, Project, EmissionCategory]),
    forwardRef(() => ProjectModule),
    HttpModule,
    UnitModule
  ],
  controllers: [EmissionSourceController, ProjectEmissionSourceController, EsDatasourceController, EsExcludeReasonController,EmissionCategoryController],
  providers: [EmissionSourceService, ProjectEmissionSourceService, EsDatasourceService, EsExcludeReasonService,EmissionCategoryService, EmissionSourceRecalService,EmissionSourceBulkService, ProgresReportService, ParameterUnit],
  exports: [ProjectEmissionSourceService, EmissionSourceService, EsDatasourceService, EsExcludeReasonService, EmissionSourceRecalService,EmissionSourceBulkService, ProgresReportService],
})
export class EmissionSourceModule {}
