import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MunicipalWaterService } from '../service/municipal-water.service';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm-next';
import { MunicipalWaterActivityData } from '../entities/municipal-water.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: MunicipalWaterActivityData,
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
@Controller('municipal-water')
export class MunicipalWaterActivityDataController implements CrudController<MunicipalWaterActivityData> {
  constructor(
    public service: MunicipalWaterService,
    @InjectRepository(MunicipalWaterActivityData)
    private readonly municipalWaterRepository: Repository<MunicipalWaterActivityData>,
    ) {}

    get base(): CrudController<MunicipalWaterActivityData> {
      return this;
    }

  @Post()
  create(@Body() createMunicipalWaterDto: MunicipalWaterActivityData): Promise<MunicipalWaterActivityData> {
    return this.service.create(createMunicipalWaterDto);
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
  update(@Param('id') id: string, @Body() updateMunicipalWaterDto: MunicipalWaterActivityData) {
    return this.service.update(+id, updateMunicipalWaterDto);
  }

  @Override()
  async deleteOne(
    @ParsedRequest() req: CrudRequest,
  ) {
    return await this.service.remove(req)
  }
}
