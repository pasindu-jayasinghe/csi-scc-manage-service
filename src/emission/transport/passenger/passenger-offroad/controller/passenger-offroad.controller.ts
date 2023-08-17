import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Repository } from 'typeorm';
import { CreatePassengerOffroadDto } from '../dto/create-passenger-offroad.dto';
import { UpdatePassengerOffroadDto } from '../dto/update-passenger-offroad.dto';
import { PassengerOffroadActivityData } from '../entities/passenger-offroad.entity';
import { PassengerOffroadService } from '../service/passenger-offroad.service';

@Crud({
  model: {
    type: PassengerOffroadActivityData,
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
@Controller('passenger-offroad')
export class PassengerOffroadActivityDataController implements CrudController<PassengerOffroadActivityData>{
  constructor(
    public service: PassengerOffroadService,
    @InjectRepository(PassengerOffroadActivityData)
    private readonly passengerRoadRepository: Repository<PassengerOffroadActivityData>
  ) { }

  get base(): CrudController<PassengerOffroadActivityData> {
    return this;
  }

  @Post()
  create(@Body() createProjectDto: PassengerOffroadActivityData): Promise<PassengerOffroadActivityData> {
    return this.service.create(createProjectDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PassengerOffroadActivityData> {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: PassengerOffroadActivityData) {
    return this.service.update(+id, updateProjectDto);
  }

  @Override()
  async deleteOne(
    @ParsedRequest() req: CrudRequest,
  ) {
    return await this.service.remove(req)
  }

}
