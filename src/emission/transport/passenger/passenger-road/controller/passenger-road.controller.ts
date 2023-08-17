import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Repository } from 'typeorm-next';
import { PassengerRoadActivityData } from '../entities/passenger-road.entity';
import { PassengerRoadService } from '../service/passenger-road.service';

@Crud({
  model: {
    type: PassengerRoadActivityData,
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
@Controller('passenger-road')
export class PassengerRoadActivityDataController implements CrudController<PassengerRoadActivityData>{
  constructor(
    public service: PassengerRoadService,
    @InjectRepository(PassengerRoadActivityData)
    private readonly passengerRoadRepository: Repository<PassengerRoadActivityData>
  ) { }

  get base(): CrudController<PassengerRoadActivityData> {
    return this;
  }

  @Post()
  create(@Body() createProjectDto: PassengerRoadActivityData): Promise<PassengerRoadActivityData> {
    return this.service.create(createProjectDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PassengerRoadActivityData> {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: PassengerRoadActivityData) {
    return this.service.update(+id, updateProjectDto);
  }

  @Override()
    async deleteOne(
      @ParsedRequest() req: CrudRequest,
    ) {
      return await this.service.remove(req)
    }
}