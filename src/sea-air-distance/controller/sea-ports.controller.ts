import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Crud, CrudController } from '@nestjsx/crud';
import { AirPortsDis } from '../entities/air-ports.entity';
import { AirPortDisService } from '../services/air-port.service';
import { CodeDto } from '../dto/code.dto';
import { SeaPortsDis } from '../entities/sea-ports.entity';
import { SeaPortDisService } from '../services/sea-ports.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: SeaPortsDis,
  },
  query: {
    join: {
      
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('seaportsdis')
export class SeaPortsDisController implements CrudController<SeaPortsDis>{
  constructor(
    public service: SeaPortDisService,
    @InjectRepository(SeaPortsDis)
    private readonly repo: Repository<SeaPortsDis>) { }

    get base(): CrudController<SeaPortsDis> {
      return this;
    }
    @Get(':id')
    findOne(@Param('id') id: string): Promise<SeaPortsDis> {
      return this.service.findOne(+id);
    }

    @Post('/disbycodes')
    async getDisBySeaportcodes
    (@Body() codes: any[]){
      return await this.service.findbyPortCodes(codes);
    }
  
  
}
