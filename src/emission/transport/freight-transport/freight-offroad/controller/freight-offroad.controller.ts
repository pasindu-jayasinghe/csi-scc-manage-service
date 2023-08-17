import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm-next';
import { FreightOffroadService } from '../service/freight-offroad.service';
import { FreightOffroadActivityData } from '../entities/freight-offroad.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: FreightOffroadActivityData,
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
@Controller('freight-offroad')
export class FreightOffroadActivityDataController implements CrudController<FreightOffroadActivityData>{
  constructor(
    public service: FreightOffroadService,
    @InjectRepository(FreightOffroadActivityData)
    private readonly freightOffRoadRepository: Repository<FreightOffroadActivityData>,
    ) {}

    get base(): CrudController<FreightOffroadActivityData> {
      return this;
    }
  @Post()
  create(@Body() createFreightOffroadDto: FreightOffroadActivityData):Promise<FreightOffroadActivityData> {
    return this.service.create(createFreightOffroadDto);
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
  update(@Param('id') id: string, @Body() updateFreightOffroadDto: FreightOffroadActivityData) {
    return this.service.update(+id, updateFreightOffroadDto);
  }

  @Override()
  async deleteOne(
    @ParsedRequest() req: CrudRequest,
  ) {
    return await this.service.remove(req)
  }
}
