import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ByUnitIdsDto } from '../dto/by-units-req.dto';
import { ProjectTypeDto } from '../dto/project-unit-req.dto';
import { ProjectUnit } from '../entities/project-unit.entity';
import { ProjectUnitEmissionSourceService } from '../service/project-unit-emission-source.service';
import { ProjectUnitService } from '../service/project-unit.service';


@Crud({
  model: {
    type: ProjectUnit,
  },
  query: {
    join: {
      project: {
        eager: true
      },
      projectUnitEmissionSources: {
        eager: true
      },
      unit: {
        eager: true
      }
    },

  },
})
@UseGuards(JwtAuthGuard)
@Controller('project-unit')
export class ProjectUnitController implements CrudController<ProjectUnit>{

  constructor(
    public service: ProjectUnitService,
    private readonly projectUnitService: ProjectUnitService,
    private readonly projectUnitEmissionSourceService: ProjectUnitEmissionSourceService
    ) {}

    get base(): CrudController<ProjectUnit> {
      return this;
    }

  @Post('')
  async create(@Body() createProjectUnitDto: ProjectUnit) {
    const pu = await this.projectUnitService.create(createProjectUnitDto);

    await Promise.all(createProjectUnitDto.projectUnitEmissionSources.map(async pues => {
      pues.projectUnit = pu;
      return await this.projectUnitEmissionSourceService.create(pues);
    }))

    return {
      id: pu?.id,
      message: "Project is created"
    };
  }

  @Post('get-project-unit-by-project-type')
  async getProjectUnitByProjectType(
   @Body() req: ProjectTypeDto
  ){
    console.log(req)
    return this.projectUnitService.getProjectUnitByProjectType(req.unitIds, req.projectType);
  }


  @Post('get-projects-unit-by-unit-ids')
  async getProjectUnitsByUntIds(
   @Body() req: ByUnitIdsDto
  ){
   return await this.projectUnitService.getProjectUnitsByUntIds(req.unitIds);
  }

  @Post('get-projects-unit-by-unit-ids-and-project')
  async getProjectUnitsByUntIdsAndProject(
   @Body() req: ByUnitIdsDto
  ){
   return await this.projectUnitService.getProjectUnitsByUntIdsAndProject(req.unitIds, req.projectId);
  }

}
