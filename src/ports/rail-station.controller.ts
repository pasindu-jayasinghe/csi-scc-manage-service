import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Crud, CrudController } from '@nestjsx/crud';
import { AirPort } from './air-port-list.entity';
import { AirPortService } from './air-port-list.service';
import { RailPort } from './rail-station.entity';
import { RailPortService } from './rail-station.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: RailPort,
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
@Controller('railports')
export class RailPortController implements CrudController<RailPort>{
  constructor(
    public service: RailPortService,
    @InjectRepository(AirPort)
    private readonly repo: Repository<RailPort>) { }

  get base(): CrudController<RailPort> {
    return this;
  }

//   //--getAirportlistByCountry
//   @Get('/:countryId')
//   async findAirPortsByCountry
//     (@Query('countryId') countryId: number) {
//     return await this.service.findbyCountry(+countryId);
//   }



}
