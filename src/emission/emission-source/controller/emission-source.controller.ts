import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { EmissionSourceService } from '../service/emission-source.service';
import { EmissionSource } from '../entities/emission-source.entity';
import { ProgressDetailDto } from '../dto/progress-detail.dto';
import { ProgresReportService } from '../service/progres-report.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


@Crud({
  model: {
    type: EmissionSource,
  },
  query: {
    join: {
      project: {
        eager: true,
      },
      
    },

  },
})
@UseGuards(JwtAuthGuard)
@Controller('emission-source')
export class EmissionSourceController implements CrudController<EmissionSource> {
  constructor(
    public service: EmissionSourceService,
    private readonly emissionSourceService: EmissionSourceService,
    private progresReportService: ProgresReportService
  ) { }

  
  @Post()
  create(@Body() createProjectDto: EmissionSource) {
    return this.emissionSourceService.create(createProjectDto);
  }
  
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emissionSourceService.findOne(+id);
  }
  
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: EmissionSource) {
    return this.emissionSourceService.update(+id, updateProjectDto);
  }
  
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emissionSourceService.remove(+id);
  }
  
  get base(): CrudController<EmissionSource> {
    return this;
  }

  @Post('seed')
  async seed(){
    this.service.seed();
  }

  // @Post('progress-detail')
  // modifyActivityData(@Body() req: ProgressDetailDto){
  //   this.progresReportService.modifyActivityData(req.acData, req.esCode)
  // }


  

}
