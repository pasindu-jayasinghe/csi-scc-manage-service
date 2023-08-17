import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm-next';
import { FreightWaterService } from '../service/freight-water.service';
import { FreightWaterActivityData } from '../entities/freight-water.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: FreightWaterActivityData,
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
      departurePortOneWay: {
        eager: true
      },
      destinationPortOneWay: {
        eager: true
      },
      departurePortTwoWay: {
        eager: true
      },
      destinationPortTwoWay: {
        eager: true
      },
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('freight-water')
export class FreightWaterActivityDataController implements CrudController<FreightWaterActivityData>{
  constructor(
    public service: FreightWaterService,
    @InjectRepository(FreightWaterActivityData)
    private readonly freightWaterRepository: Repository<FreightWaterActivityData>,
    ) {}

    get base(): CrudController<FreightWaterActivityData> {
      return this;
    }

  @Post()
  create(@Body() createFreightWaterDto: FreightWaterActivityData):Promise<FreightWaterActivityData> {
    return this.service.create(createFreightWaterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFreightWaterDto: FreightWaterActivityData) {
    return this.service.update(+id, updateFreightWaterDto);
  }

  
  @Override()
  async deleteOne(
    @ParsedRequest() req: CrudRequest,
  ) {
    return await this.service.remove(req)
  }

}
