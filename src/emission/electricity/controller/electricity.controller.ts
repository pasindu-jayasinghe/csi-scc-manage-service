import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ElectricityService } from '../service/electricity.service';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';

import { ElectricityActivityData } from '../entities/electricity.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: ElectricityActivityData,
  },
  query: {
    join: {
      project: {
        eager: true,
      },
      user: {
        eager: true,
      },
      unit: {
        eager: true
      }
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('electricity')
export class ElectricityActivityDataController implements CrudController<ElectricityActivityData> {
  constructor(
    public service: ElectricityService,
    @InjectRepository(ElectricityActivityData)
    private readonly elecRepository: Repository<ElectricityActivityData>,
  ) {}

  get base(): CrudController<ElectricityActivityData> {
    return this;
  }

  @Post()
  create(@Body() createProjectDto: ElectricityActivityData): Promise<ElectricityActivityData> {

    // createProjectDto.activityDataStatus = 
    return this.service.create(createProjectDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ElectricityActivityData> {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: ElectricityActivityData) {
    return this.service.update(+id, updateProjectDto);
  }


  @Override()
  async deleteOne(
    @ParsedRequest() req: CrudRequest,
  ) {
    console.log("----------------")
    console.log(req.options);
    console.log(req.options.params);
    console.log(req.options.query);
    console.log(req.options.routes);
    return await this.service.remove(req)
  }




}
