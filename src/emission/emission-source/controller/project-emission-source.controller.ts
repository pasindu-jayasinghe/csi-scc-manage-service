import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Crud, CrudController } from '@nestjsx/crud';
import { ProjectEmissionSource } from '../entities/project-emission-source.entity';
import { ProjectEmissionSourceService } from '../service/project-emission-source.service';
import { ProgressDetailDto } from '../dto/progress-detail.dto';
import { ProgresReportService } from '../service/progres-report.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: ProjectEmissionSource,
  },
  query: {
    join: {
      project: {
        eager: true,
      },
      emissionSource: {
        eager: true
      }
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('project-emission-source')
export class ProjectEmissionSourceController implements CrudController<ProjectEmissionSource>{
  constructor(
    public service: ProjectEmissionSourceService,
    @InjectRepository(ProjectEmissionSource)
    private readonly evidenceRepository: Repository<ProjectEmissionSource>,
    private progresReportService: ProgresReportService) { }

    get base(): CrudController<ProjectEmissionSource> {
      return this;
    }
    @Get(':id')
    findOne(@Param('id') id: string): Promise<ProjectEmissionSource> {
      return this.service.findOne(+id);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProjectDto: ProjectEmissionSource) {
      return this.service.update(+id, updateProjectDto);
    }

    @Get('get-emissions-totals/:id')
    async etEmissionsTotals(@Param('id') projectId: number):Promise<any[]> {


      return await this.service.etEmissionsTotals(projectId);
    }

  // @Post('progress-detail')
  // async modifyActivityData(@Body() req: ProgressDetailDto):Promise<any> {
  //   return await this.progresReportService.modifyActivityData(req.acData, req.esCode, req.parameters)
  // }
}
