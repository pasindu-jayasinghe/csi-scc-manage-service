import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm-next';
import { FreightRoadService } from '../service/freight-road.service';
import { FreightRoadActivityData } from '../entities/freight-road.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: FreightRoadActivityData,
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
@Controller('freight-road')
export class FreightRoadActivityDataController implements CrudController<FreightRoadActivityData>{
  constructor(
    public service: FreightRoadService,
    @InjectRepository(FreightRoadActivityData)
    private readonly freightRoadRepository: Repository<FreightRoadActivityData>,
    ) {}

    get base(): CrudController<FreightRoadActivityData> {
      return this;
    }
  @Post()
  create(@Body() createFreightRoadDto: FreightRoadActivityData):Promise<FreightRoadActivityData> {
    return this.service.create(createFreightRoadDto);
  }

  // @Get()
  // findAll() {
  //   return this.service.findAll();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFreightRoadDto: FreightRoadActivityData) {
    return this.service.update(+id, updateFreightRoadDto);
  }

  @Override()
    async deleteOne(
      @ParsedRequest() req: CrudRequest,
    ) {
      return await this.service.remove(req)
    }

}
