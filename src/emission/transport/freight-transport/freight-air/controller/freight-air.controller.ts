import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FreightAirService } from '../service/freight-air.service';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { FreightAirActivityData } from '../entities/freight-air.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm-next';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: FreightAirActivityData,
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
      },
      departureCountryOneWay: {
        eager: true
      },
      destinationCountryOneWay: {
        eager: true
      },
      departureCountryTwoWay: {
        eager: true
      },
      destinationCountryTwoWay: {
        eager: true
      },
      transist_oneWay_1: {
        eager: true
      },
      transist_oneWay_2: {
        eager: true
      },
      transist_oneWay_3: {
        eager: true
      },
      transist_twoWay_1: {
        eager: true
      },
      transist_twoWay_2: {
        eager: true
      },
      transist_twoWay_3: {
        eager: true
      },
      departureAirportOneWay: {
        eager: true
      },
      destinationAirportOneWay: {
        eager: true
      },
      departureAirportTwoWay: {
        eager: true
      },
      destinationAirportTwoWay: {
        eager: true
      },
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('freight-air')
export class FreightAirActivityDataController implements CrudController<FreightAirActivityData>{
  constructor(
    public service: FreightAirService,
    @InjectRepository(FreightAirActivityData)
    private readonly freightAirRepository: Repository<FreightAirActivityData>,
    ) {}

    get base(): CrudController<FreightAirActivityData> {
      return this;
    }

  @Post()
  create(@Body() createFreightAirDto: FreightAirActivityData): Promise<FreightAirActivityData> {
    return this.service.create(createFreightAirDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFreightAirDto: FreightAirActivityData) {
    return this.service.update(+id, updateFreightAirDto);
  }

  @Override()
  async deleteOne(
    @ParsedRequest() req: CrudRequest,
  ) {
    return await this.service.remove(req)
  }

}
