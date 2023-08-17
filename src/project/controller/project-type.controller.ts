import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProjectType } from '../entities/project-type.entity';
import { ProjectTypeService } from '../service/project-type.service';


@Crud({
  model: {
    type: ProjectType,
  },
  query: {
    join: {
    
    },

  },
})
@UseGuards(JwtAuthGuard)
@Controller('Project-type')
export class ProjectTypeController implements CrudController<ProjectType>{

  constructor(
    public service: ProjectTypeService,
    private readonly ProjectTypeService: ProjectTypeService) {}

  get base(): CrudController<ProjectType> {
    return this;
  }

  @Post('')
  create(@Body() createProjectTypeDto: ProjectType) {
    return this.ProjectTypeService.create(createProjectTypeDto);
  }

  // // @Get()
  // // findAll() {
  // //   return this.ProjectTypeService.findAll();
  // // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.ProjectTypeService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProjectTypeDto: UpdateProjectTypeDto) {
  //   return this.ProjectTypeService.update(+id, updateProjectTypeDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.ProjectTypeService.remove(+id);
  // }


 

}
