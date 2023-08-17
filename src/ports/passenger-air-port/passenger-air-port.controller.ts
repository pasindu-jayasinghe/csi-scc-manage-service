import { Controller, Get, Query } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { PassengerAirPort } from './passenger-air-port.entity';
import { PassengerAirPortService } from './passenger-air-port.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Crud({
    model: {
      type: PassengerAirPort,
    },
    query: {
      join: {},
    },
  })
@Controller('passenger-air-port')
export class PassengerAirPortController implements CrudController<PassengerAirPort>{

    constructor(
        public service: PassengerAirPortService,
        @InjectRepository(PassengerAirPort)
        private readonly repo: Repository<PassengerAirPort>) { }

    get base(): CrudController<PassengerAirPort> {
        return this;
    }

    @Get('get-airport-by-code')
    async getAirportByCode(@Query('code') code: string){
        return await this.service.getAirportByCode(code)
    }
}

