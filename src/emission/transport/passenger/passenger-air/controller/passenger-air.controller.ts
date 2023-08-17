import { Controller, Get, Post, Body, Patch, Param, Delete, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { Repository } from 'typeorm';
import { CreatePassengerAirDto } from '../dto/create-passenger-air.dto';
import { UpdatePassengerAirDto } from '../dto/update-passenger-air.dto';
import { PassengerAirActivityData } from '../entities/passenger-air.entity';
import { PassengerAirService } from '../service/passenger-air.service';
import { IcaoDto } from '../dto/icao.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: PassengerAirActivityData,
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
@Controller('passenger-air')
export class PassengerAirActivityDataController implements CrudController<PassengerAirActivityData>{
  constructor(
    public service: PassengerAirService,
    @InjectRepository(PassengerAirActivityData)
    private readonly passengerRailRepository: Repository<PassengerAirActivityData>,

  ) { }

  get base(): CrudController<PassengerAirActivityData> {
    return this;
  }

  @Post()
  create(@Body() createProjectDto: PassengerAirActivityData): Promise<PassengerAirActivityData> {
    return this.service.create(createProjectDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PassengerAirActivityData> {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: PassengerAirActivityData) {
    return this.service.update(+id, updateProjectDto);
  }


  @Post('icao')
  async icaoApi(@Body() req: IcaoDto) {
    return this.service.icaoApi(req)
  }

  @Override()
  async deleteOne(
    @ParsedRequest() req: CrudRequest,
  ) {
    return await this.service.remove(req)
  }

}


// ASP.NET_SessionId=q0dmrhiwrzo3sbkl33d3p5rt; TS01e182e3=0106b70136c4d28f0c68f7dfb80af8d7ae6f958fdeb8ca16b6ce3ea8fee9e9ea3bf93dc0bb8f8453761d66b755b4d97c4b479e177ee39b8c2953ef32574ce84545e84b6e52