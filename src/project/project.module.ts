import { Module } from '@nestjs/common';
import { ProjectService } from './service/project.service';
import { ProjectController } from './controller/project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { MethodologyService } from './service/methodology.service';
import { ProjectTypeService } from './service/project-type.service';
import { ProjectType } from './entities/project-type.entity';
import { Methodology } from './entities/methodology.entity';
import { ProjectUnit } from './entities/project-unit.entity';
import { ProjectUnitEmissionSource } from './entities/project-unit-emission-source.entity';
import { ProjectTypeController } from './controller/project-type.controller';
import { MethodologyController } from './controller/methodology.controller';
import { EmissionSourceModule } from '../emission/emission-source/emission-source.module';
import { ProjectUnitService } from './service/project-unit.service';
import { ProjectUnitController } from './controller/project-unit.controller';
import { ProjectUnitEmissionSourceService } from './service/project-unit-emission-source.service';
import { ProjectUnitEmissionSourceController } from './controller/project-unit-emission-source.controller';
import { forwardRef } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { UnitModule } from 'src/unit/unit.module';
import { ProjectEmissionFactorService } from './service/project-emission-factor.service';
import { ProjectEmissionFactorController } from './controller/project-emission-factor.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from 'src/auth/service/auth.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectType,
      Methodology,
      ProjectUnit,
      ProjectUnitEmissionSource,
    ]),
    forwardRef(() => EmissionSourceModule),
    UsersModule,
    UnitModule,
    HttpModule
  ],

  controllers: [
    ProjectController,
    ProjectTypeController,
    MethodologyController,
    ProjectUnitController,
    ProjectUnitEmissionSourceController,
    ProjectEmissionFactorController
  ],
  providers: [ProjectService, ProjectTypeService, MethodologyService, ProjectUnitService, ProjectUnitEmissionSourceService, ProjectEmissionFactorService, AuthService],
  exports: [ProjectService, ProjectTypeService, ProjectUnitEmissionSourceService,ProjectUnitService, ProjectEmissionFactorService]
})
export class ProjectModule {}
