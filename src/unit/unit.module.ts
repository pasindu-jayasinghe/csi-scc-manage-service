import { Module } from '@nestjs/common';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { Unit } from './entities/unit.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LevelController } from './level.controller';
import { LevelService } from './level.service';
import { Level } from './entities/level.entity';
import { UnitDetails } from './entities/unit-details.entity';
import { UnitDetailsController } from './unit-details.controller';
import { UnitDetailsService } from './unit-details.service';
import { CountryModule } from 'src/country/country.module';
import { Industry } from './entities/industry.entity';
import { IndustryService } from './industry.service';
import { IndustryController } from './industry.controller';
import { NumEmployee } from './entities/num-employee.entity';
import { NumEmployeesController } from './num-employees.controller';
import { NumEmployeesService } from './num-employees.service';
import { PrevReport } from './entities/prev-report.entity';
import { PrevReportsController } from './prev-reports.controller';
import { PrevReportsService } from './prev-reports.service';
import { PrevEmission } from './entities/prev-emission.entity';
import { PrevEmissionService } from './service/prev-emission.service';
import { PrevEmissionController } from './controller/prev-emission.controller';
import { ProjectService } from 'src/project/service/project.service';
import { Project } from 'src/project/entities/project.entity';
import { ProjectController } from 'src/project/controller/project.controller';
import { UnitDetailMessage } from './entities/unit-detail-message.entity';
import { UnitDetailMessageService } from './service/unit-detail-message.service';
import { UnitDetailMessageController } from './controller/unit-detail-message.controller';


@Module({
  imports:[TypeOrmModule.forFeature([Unit,Level,UnitDetails, Industry, NumEmployee, PrevReport,PrevEmission,Project, UnitDetailMessage]), CountryModule],
  controllers: [UnitController,LevelController,UnitDetailsController,IndustryController, NumEmployeesController, PrevReportsController,PrevEmissionController, UnitDetailMessageController],
  providers: [UnitService,LevelService,UnitDetailsService,IndustryService, NumEmployeesService, PrevReportsService,PrevEmissionService,ProjectService, UnitDetailMessageService],
  exports:[UnitService,LevelService,UnitDetailsService, IndustryService, NumEmployeesService, PrevReportsService,PrevEmissionService,ProjectService]
})
export class UnitModule {}
