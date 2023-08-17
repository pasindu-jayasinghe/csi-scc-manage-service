import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Crud, CrudController } from '@nestjsx/crud';
import { AirPort } from './air-port-list.entity';
import { AirPortService } from './air-port-list.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: AirPort,
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
@Controller('airports')
export class AirPortController implements CrudController<AirPort>{
  constructor(
    public service: AirPortService,
    @InjectRepository(AirPort)
    private readonly repo: Repository<AirPort>) { }

  get base(): CrudController<AirPort> {
    return this;
  }

  //--getAirportlistByCountry
  @Get('/:countryId')
  async findAirPortsByCountry
    (@Query('countryId') countryId: number) {
    return await this.service.findbyCountry(+countryId);
  }



}
