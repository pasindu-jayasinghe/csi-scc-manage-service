import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { sourceName } from 'src/emission/enum/sourcename.enum';
import { ByProjectUnitIdsDto } from '../dto/by-project-units-req.dto';
import { EmissionSumDto, OrgEmissionDto } from '../dto/dashboard.dto';
import { ProjectTypeDto } from '../dto/project-unit-req.dto';
import { PuesDataReqDto } from '../dto/pues-data-req.dto';
import { PuesDataDto } from '../dto/pues-data.dto';
import { ProjectUnitEmissionSource } from '../entities/project-unit-emission-source.entity';
import { ProjectUnitEmissionSourceService } from '../service/project-unit-emission-source.service';
import { ProjectUnitService } from '../service/project-unit.service';
import { ProjectService } from '../service/project.service';

@Crud({
  model: {
    type: ProjectUnitEmissionSource,
  },
  query: {
    join: {
      emissionSource: {
        eager: true
      },
      projectUnit: {
        eager: true,
      },
      assignedESList: {
        eager: true,
      }
    },

  },
})
@UseGuards(JwtAuthGuard)
@Controller('project-unit-emission-source')
export class ProjectUnitEmissionSourceController implements CrudController<ProjectUnitEmissionSource>{

  constructor(
    public service: ProjectUnitEmissionSourceService,
    public projectService: ProjectService,
    public puService: ProjectUnitService,
    private readonly ProjectUnitEmissionSourceService: ProjectUnitEmissionSourceService) {}

    get base(): CrudController<ProjectUnitEmissionSource> {
      return this;
    }

  @Post('')
  create(@Body() createProjectUnitEmissionSourceDto: ProjectUnitEmissionSource) {
    return this.ProjectUnitEmissionSourceService.create(createProjectUnitEmissionSourceDto);
  }

  @Get('get-emissions-by-type')
  async getEmissionsByType(@Query('projectId') id : number){
    return this.ProjectUnitEmissionSourceService.getEmissionsByType(id);
  }

  @Get('get-project-unit-by-type')
  async getProjectUnitByType(
    @Query('unitId') id: number,
    @Query('type') type: string,
    @Query('projectType') projectType: string
     ){
    return this.ProjectUnitEmissionSourceService.getProjectUnitByType(id, type, projectType);
  }


  @Post('get-pues-data')
  async getPuesData(@Body()req: PuesDataReqDto): Promise<PuesDataDto>{
    return await this.service.getPuesData(req);
  }

  @Get('has-PUES')
  async hasPUES(
    @Query('unitId') unitId: number, 
    @Query('projectId') projectId: number, 
    @Query('esCode') esCode: sourceName
  ){
    return await this.service.hasPUES(unitId, projectId, esCode);
  }

  @Get('get-org-es-emissions')
  async getOrgEmissionSourceEmissions(
    @Query('unitId') ids: number[],
    @Query('projectType') type: string,

    // @Body() req: {unitIds: number[], type: string}
  ):Promise<OrgEmissionDto>{
    return this.service.getOrgEmissionSourceEmissions(ids, type);
  }

  @Post('get-sum-for-project-units')
  async getSumForProjectUnits(
    @Body() req: ProjectTypeDto
  ){
    return await this.service.getSumForProjectUnits(req.unitIds, req.projectType)
  }

  @Post('get-sum-for-project-units-for-org-dashboard')
  async getSumForProjectUnitsForOrgDashboard(
    @Body() req: ProjectTypeDto
  ):Promise<EmissionSumDto>{
    let year = await this.puService.getLatestYearOfUnits(req.unitIds, req.projectType);
    let res = await this.service.getSumForProjectUnits(req.unitIds, req.projectType)
    let result = res.filter(o => o.year === year)
    let sum = {direct: 0, indirect: 0, other: 0}
    result.map(o => {
      sum.direct += o.directEmission
      sum.indirect += o.indirectEmission
      sum.other += o.otherEmission
    })
    let sumDto = new EmissionSumDto()
    sumDto.sum = sum
    sumDto.activeYear = year
    return sumDto
  }
 

  @Get('get-allowed-units-for--roject-and-es')
  async getAllowedUnitsforProjectAndEs(
    @Query('es') es: sourceName, 
    @Query('projectId') projectId: number
  ){
   return await this.service.getAllowedUnitsforProjectAndEs(projectId, es);
  }



  @Post('get-projects-unit-eslist-by-project-unit-ids')
  async getProjectUnitESListByProjectUntIds(
   @Body() req: ByProjectUnitIdsDto
  ){
   return await this.service.getProjectUnitESListByProjectUntIds(req.projectUnitIds);
  }


  @Post('get-pues-list-by-project-and-unit')
  async PUESListBYProjectAndUYnit(
    @Query('unitId') unitId: number, 
    @Query('projectId') projectId: number
  ){
    
  }
  
  @Post('get-pues-and-unit')
  async getPUESAndUnit(
    @Query('projectId') projectId: number
  ){
    console.log(projectId)
    return await this.service.getPUESAndUnit(projectId)
  }

  @Post('es-emission-chart-data')
  async esEmissionChartData(
   @Body() req: ProjectTypeDto
  ): Promise<any>{
    return this.service.esEmissionChartData(req.unitIds, req.projectType);
  }

}
