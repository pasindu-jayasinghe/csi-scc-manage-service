import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { EmissionSourceService } from './emission/emission-source/service/emission-source.service';
import { sourceName } from './emission/enum/sourcename.enum';
import { ParameterService } from './parameter/service/parameter.service';
import { PuesDataReqDto } from './project/dto/pues-data-req.dto';
import { ProjectTypeService } from './project/service/project-type.service';
import { ProjectUnitEmissionSourceService } from './project/service/project-unit-emission-source.service';
import { ProjectService } from './project/service/project.service';
import { IndustryService } from './unit/industry.service';
import { UsersService } from './users/users.service';
import { exec } from 'child_process'

@Controller()
export class AppController {
  constructor(
    private projectTypeService: ProjectTypeService,
    private emissionSourceService: EmissionSourceService,
    private parameterService: ParameterService,
    private industryService: IndustryService, 
    private readonly appService: AppService,
    private usersService: UsersService,
    private projectUnitEmissionSourceService: ProjectUnitEmissionSourceService,
    private projectService: ProjectService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('deloy')
  deloy(){
    console.log("deloying the system ---------------------------------")
    exec('sh /home/ubuntu/deploy-user-service.sh',
        (error, stdout, stderr) => {
            console.log(stdout);
            console.log(stderr);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
        });
        
    return true;
  }

  @Post('seed-all')
  async seedAll() {
    // await this.projectTypeService.seed();
  //  await this.emissionSourceService.seed();
    await this.parameterService.seed();
    // await this.industryService.seed();
  }

  @Post('test')
  async test(){
    let user = await this.usersService.findOne(13);
    let project = await this.projectService.findOne(65);

    let req = new PuesDataReqDto();
    req.user = user;
    req.project = project;
    req.sourceName = sourceName.Electricity;

    await this.projectUnitEmissionSourceService.getPuesData(req);
  }

  

  @Post('test-log')
  async testLog(){
    return true;
  }


}
