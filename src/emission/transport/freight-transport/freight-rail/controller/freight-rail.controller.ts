import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FreightRailService } from '../service/freight-rail.service';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm-next';
import { FreightRailActivityData } from '../entities/freight-rail.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: FreightRailActivityData,
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
@Controller('freight-rail')
export class FreightRailActivityDataController implements CrudController<FreightRailActivityData>{
  constructor(
    public service: FreightRailService,
    @InjectRepository(FreightRailActivityData)
    private readonly freightRailRepository: Repository<FreightRailActivityData>,
    ) {}

    get base(): CrudController<FreightRailActivityData> {
      return this;
    }
  @Post()
  create(@Body() createFreightRailDto: FreightRailActivityData): Promise<FreightRailActivityData> {
    return this.service.create(createFreightRailDto);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFreightRailDto: FreightRailActivityData) {
    return this.service.update(+id, updateFreightRailDto);
  }


  @Override()
  async deleteOne(
    @ParsedRequest() req: CrudRequest,
  ) {
    return await this.service.remove(req)
  }


}
