import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Crud, CrudController } from '@nestjsx/crud';
import { AirPortsDis } from '../entities/air-ports.entity';
import { AirPortDisService } from '../services/air-port.service';
import { CodeDto } from '../dto/code.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: AirPortsDis,
  },
  query: {
    join: {

    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('airdis')
export class AirPortDisController implements CrudController<AirPortsDis>{
  constructor(
    public service: AirPortDisService,
    @InjectRepository(AirPortsDis)
    private readonly repo: Repository<AirPortsDis>) { }

  get base(): CrudController<AirPortsDis> {
    return this;
  }
  @Get(':id')
  findOne(@Param('id') id: string): Promise<AirPortsDis> {
    return this.service.findOne(+id);
  }

  @Post('/disbycodes')
  async getDisByAirportcodes
    (@Body() codes: any[]) {
    return await this.service.findbyPortCodes(codes);
  }


}
