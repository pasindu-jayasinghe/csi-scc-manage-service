import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Repository } from 'typeorm';
import { CreateOffroadMachineryOffroadDto } from '../dto/create-offroad-machinery-offroad.dto';
import { UpdateOffroadMachineryOffroadDto } from '../dto/update-offroad-machinery-offroad.dto';
import { OffroadMachineryOffroadActivityData } from '../entities/offroad-machinery-offroad.entity';
import { OffroadMachineryOffroadService } from '../service/offroad-machinery-offroad.service';

@Crud({
  model: {
    type: OffroadMachineryOffroadActivityData,
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
        eager: true,
      }
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('offroad-machinery-offroad')
export class OffroadMachineryOffroadActivityDataController implements CrudController<OffroadMachineryOffroadActivityData>{
  constructor(
    public service: OffroadMachineryOffroadService,
    @InjectRepository(OffroadMachineryOffroadActivityData)
    private readonly passengerRoadRepository: Repository<OffroadMachineryOffroadActivityData>
  ) { }

  get base(): CrudController<OffroadMachineryOffroadActivityData> {
    return this;
  }

  @Post()
  create(@Body() createProjectDto: OffroadMachineryOffroadActivityData): Promise<OffroadMachineryOffroadActivityData> {
    return this.service.create(createProjectDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<OffroadMachineryOffroadActivityData> {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: OffroadMachineryOffroadActivityData) {
    return this.service.update(+id, updateProjectDto);
  }

  @Override()
  async deleteOne(
    @ParsedRequest() req: CrudRequest,
  ) {
    return await this.service.remove(req)
  }
}
