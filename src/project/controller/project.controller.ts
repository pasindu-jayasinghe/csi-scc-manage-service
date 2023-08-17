import { Controller, Get, Post, Body, Put, InternalServerErrorException, forwardRef, Inject, Patch, Query, UseGuards } from '@nestjs/common';
import { ProjectService } from '../service/project.service';
import { Project } from '../entities/project.entity';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { EmissionSourceOfProject } from '../dto/emission-source-of-project.dto';
import { EmissionSourceOfProjectUnit } from '../dto/emission-source-of-project-unit.dto';
import { ProjectEmissionSourceService } from 'src/emission/emission-source/service/project-emission-source.service';
import { ProjectUnitEmissionSourceService } from '../service/project-unit-emission-source.service';

import { projectStatus } from '../enum/project-status.enum';
import { ProjectUnitService } from '../service/project-unit.service';
import { EmissionSourceListOfProject } from '../dto/emission-source-list-of-project.dto';
import { EmissionSourceListOfProjectUnit } from '../dto/emission-source-list-of-project-unit.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LoginRole } from 'src/auth/constants';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UnitService } from 'src/unit/unit.service';
import { ActiveClosedProjectDto, OrgEmissionDto } from '../dto/dashboard.dto';
import { ListOfEmissionSourceOfProjectUnit } from '../dto/list-of-emission-source-of-project-unit.dto';
import { PesEmissionsDto } from 'src/emission/emission-source/dto/pes-emissions.dto';



// @UseGuards(JwtAuthGuard)
// @Roles(LoginRole.MASTER_ADMIN,LoginRole.CSI_ADMIN)
@Crud({
  model: {
    type: Project,
  },
  query: {
    join: {
      projectEmissionSources: {
        eager: true,
      },
      projectUnits: {
        eager: true,
      },
      projectType: {
        eager: true,
      },
      methodology: {
        eager: true,
      },
      verifier: {
        eager: true,
      },
      enteredBy: {
        eager: true,
      },
      ownerUnit:{
        eager: true
      },
      responsiblePerson: {
        eager: true
      }
    },

  },
})
@UseGuards(JwtAuthGuard)
@Controller('project')
export class ProjectController implements CrudController<Project>{

  constructor( 
    public service: ProjectService,
    private readonly projectService: ProjectService,
    private readonly projectUnitService: ProjectUnitService,
    private readonly projectEmissionSourceService: ProjectEmissionSourceService,
    private readonly projectUnitEmissionSourceService: ProjectUnitEmissionSourceService,
    private unitService: UnitService
  ) {}

  get base(): CrudController<Project> {
    return this;
  }

  @Post('')
  async create(@Body() createProjectDto: Project) {
    // createProjectDto.projectStatus = projectStatus.New;
    if(!createProjectDto.verifier.id){
      createProjectDto.verifier = undefined;
    }
    const project = await this.projectService.create(createProjectDto);


    // saving each project emission sources
    await Promise.all(createProjectDto.projectEmissionSources.map(async pes => {
      pes.project = project;
      return await this.projectEmissionSourceService.create(pes);
    }));



    //saving each project units
    await Promise.all(createProjectDto.projectUnits.map(async pu => {
      pu.project = project;
      const projectUnit = await this.projectUnitService.create(pu);

      // saving each project unit emission sources
      await Promise.all(pu.projectUnitEmissionSources.map(async pues => {
        pues.projectUnit = projectUnit;
        return this.projectUnitEmissionSourceService.create(pues);
      }))

      return projectUnit;
    }))

    return {
      status: true,
      id: project.id,
      message: "Project is created"
    };
  }

  @Get('get-emission-source-of-project')
  async getProjectEmissionSources(@Query('id') id: number): Promise<PesEmissionsDto[]>{
    return await this.projectEmissionSourceService.getProjectEmissionSources(id);
  }

  @Get('get-emission-source-of-project-unit')
  async getProjectUnitEmissionSources(@Query('id') id: number){
    return this.projectUnitEmissionSourceService.getProjectUnitEmissionSources(id);
  }

  @Put('remove-emission-source-of-project')
  async removeEmissionSourceOfProject(@Body() emissionSourceOfProject: EmissionSourceOfProject) {    
    return await this.projectEmissionSourceService.removeByProjectAndEmissionSource(emissionSourceOfProject.projetId, emissionSourceOfProject.emissionSourceId);
  }

  @Post('add-emission-source-of-project')
  async addEmissionSourceOfProject(@Body() emissionSourceOfProject: EmissionSourceOfProject) {
    return await this.projectEmissionSourceService.addProjectEmissionSource(emissionSourceOfProject.projetId, emissionSourceOfProject.emissionSourceId);
  }
 
  @Put('remove-emission-source-of-project-unit')
  async removeEmissionSourceOfProjectUnit(@Body() emissionSourceOfProjectUnit: EmissionSourceOfProjectUnit) {
    return await this.projectUnitEmissionSourceService.removeByProjectUnitAndEmissionSource(emissionSourceOfProjectUnit.projetUnitId, emissionSourceOfProjectUnit.emissionSourceId);
  }

  @Post('add-emission-source-of-project-unit')
  async addEmissionSourceOfProjectUnit(@Body() emissionSourceOfProjectUnit: EmissionSourceOfProjectUnit) {
    return await this.projectUnitEmissionSourceService.addProjectUnitEmissionSource(
      emissionSourceOfProjectUnit.projetUnitId,
      emissionSourceOfProjectUnit.emissionSourceId,
      emissionSourceOfProjectUnit.tier,
      emissionSourceOfProjectUnit.clasification,
      emissionSourceOfProjectUnit.mobile,
      emissionSourceOfProjectUnit.stationery,
      emissionSourceOfProjectUnit.scope
    );
  }





  
  
  @Put('remove-emission-source-of-project-multiple')
  async removeEmissionSourceOfProjectMultiple(@Body() emissionSourcesOfProject: EmissionSourceListOfProject) {

    const projectUnits = await this.projectUnitService.find({
      project: {id:emissionSourcesOfProject.projetId}
    })

    return await Promise.all(emissionSourcesOfProject.emissionSourceIdList.map(async esId=> {
      const res = await this.projectEmissionSourceService.removeByProjectAndEmissionSource(emissionSourcesOfProject.projetId, esId);
      if(res.status){
        await Promise.all(projectUnits.map(async pu => {
          return await this.projectUnitEmissionSourceService.removeByProjectUnitAndEmissionSource(pu.id, esId);
        }))
      }
      return res;
    }))
  }

  @Post('add-emission-source-of-project-multiple')
  async addEmissionSourceOfProjectMultiple(@Body() emissionSourcesOfProject: EmissionSourceListOfProject) {
    return await Promise.all(emissionSourcesOfProject.emissionSourceIdList.map(async esId=> {
      return await this.projectEmissionSourceService.addProjectEmissionSource(emissionSourcesOfProject.projetId, esId);
    }))
  }




  // @Put('remove-emission-source-of-project-unit-multiple')
  // async removeEmissionSourceOfProjectUnitMultiple(@Body() ) {
  //   return await this.projectUnitEmissionSourceService.removeByProjectUnitAndEmissionSourceList([],1);
  // }

  @Post('add-emission-source-of-project-unit-multiple')
  async addEmissionSourceOfProjectUnitMultiple(@Body() emissionSourceListOfProjectUnit: ListOfEmissionSourceOfProjectUnit) {
    return await Promise.all(emissionSourceListOfProjectUnit.list.map(async newEs=> {
      return await this.projectUnitEmissionSourceService.addProjectUnitEmissionSource(
        newEs.projetUnitId,
        newEs.emissionSourceId,
        newEs.tier,        
        newEs.clasification,
        newEs.mobile,
        newEs.stationery,
        newEs.scope
      );
    }))
  }



  @Patch('changeStatus')
  changeStatus( @Query('id') id:number, @Query('status') status:projectStatus): Promise<Project> {   
    return this.service.chnageStatus(id,status);
  }

  @Patch('add-payment-ref')
  addPaymentRef( @Query('id') id:number, @Query('ref') ref:string): Promise<Project> {   
    return this.service.addPaymentRef(id,ref);
  }

  @Patch('set-owner-unit')
  async setOwnerUnit( @Query('id') id:number,  @Query('unitId') unitId:number){
    let unit = await this.unitService.findOne(unitId);
    return await this.service.setOwnerUnit(id, unit);
  }

  @Get('get-org-emissions')
  async getOrgEmissions(
    @Query('unitIds') ids: number[],
    @Query('projectType') type: string, 
    // @Body() req: {unitIds: number[], type: string}
  ): Promise<OrgEmissionDto>{
    let res =  this.projectService.getOrgEmissions(ids, type)
    return res
  }

  @Get('get-closed-active-projects-count')
  async getClosedAndActiveProjectsCount(@Query('unitId') unitId?: number):Promise<ActiveClosedProjectDto>{
    return await this.projectService.getClosedAndActiveProjectsCount(unitId)
  }
 

}
