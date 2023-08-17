import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Crud, CrudController } from '@nestjsx/crud';
import { AirPort } from './air-port-list.entity';
import { AirPortService } from './air-port-list.service';
import { SeaPort } from './sea-port-list.entity';
import { SeaPortService } from './sea-ports-list.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: SeaPort,
  },
  query: {
    join: {

      country: {
        eager: true,
      },

    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('seaports')
export class SeaPortController implements CrudController<SeaPort>{
  constructor(
    public service: SeaPortService,
    @InjectRepository(SeaPort)
    private readonly repo: Repository<SeaPort>) { }

  get base(): CrudController<SeaPort> {
    return this;
  }

  //--getSeaportlistByCountry
  @Get('/:countryId')
  async findSeaPortsByCountry
    (@Query('countryId') countryId: number) {
    return await this.service.findbyCountry(+countryId);
  }



}
