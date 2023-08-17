import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { WeldingEsService } from '../service/welding-es.service';
import { WeldingEsActivityData } from '../entities/welding-es.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm-next';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: WeldingEsActivityData,
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
@Controller('welding-es')
export class WeldingEsActivityDataController implements CrudController<WeldingEsActivityData>{
  constructor(
    public service: WeldingEsService,
    //private readonly weldingEsService: WeldingEsService
    @InjectRepository(WeldingEsActivityData)
    private readonly weldRepository: Repository<WeldingEsActivityData>,
    ) {}

    get base(): CrudController<WeldingEsActivityData> {
      return this;
    }

  @Post()
  create(@Body() createProjectDto: WeldingEsActivityData): Promise<WeldingEsActivityData> {
    return this.service.create(createProjectDto);
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
  update(@Param('id') id: string, @Body() updateWeldingEsDto: WeldingEsActivityData) {
    return this.service.update(+id, updateWeldingEsDto);
  }

  @Override()
    async deleteOne(
      @ParsedRequest() req: CrudRequest,
    ) {
      return await this.service.remove(req)
    }

}
