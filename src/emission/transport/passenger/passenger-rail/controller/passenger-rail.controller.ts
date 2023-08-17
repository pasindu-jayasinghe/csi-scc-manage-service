import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Repository } from 'typeorm';
import { PassengerRailActivityData } from '../entities/passenger-rail.entity';
import { PassengerRailService } from '../service/passenger-rail.service';


@Crud({
  model: {
    type: PassengerRailActivityData,
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
@Controller('passenger-rail')
export class PassengerRailActivityDataController implements CrudController<PassengerRailActivityData>{
  constructor(
    public service: PassengerRailService,
    @InjectRepository(PassengerRailActivityData)
    private readonly passengerRailRepository: Repository<PassengerRailActivityData>
  ) { }

  get base(): CrudController<PassengerRailActivityData> {
    return this;
  }

  @Post()
  create(@Body() createProjectDto: PassengerRailActivityData): Promise<PassengerRailActivityData> {
    return this.service.create(createProjectDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PassengerRailActivityData> {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: PassengerRailActivityData) {
    return this.service.update(+id, updateProjectDto);
  }

  @Override()
  async deleteOne(
    @ParsedRequest() req: CrudRequest,
  ) {
    return await this.service.remove(req)
  }
}
