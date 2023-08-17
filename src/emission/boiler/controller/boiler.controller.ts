import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BoilerService } from '../service/boiler.service';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoilerActivityData } from '../entities/boiler.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


@Crud({
  model: {
    type: BoilerActivityData,
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
@Controller('boiler')
export class BoilerActivityDataController implements CrudController<BoilerActivityData>{
  constructor(
    public service: BoilerService,
    @InjectRepository(BoilerActivityData)
    private readonly boilRepository: Repository<BoilerActivityData>,
    ) {}

    get base(): CrudController<BoilerActivityData> {
      return this;
    }

  @Post()
  create(@Body() createBoilerDto: BoilerActivityData): Promise<BoilerActivityData> {
    return this.service.create(createBoilerDto);
  }


  @Get(':id')
  findOne(@Param('id') id: string): Promise<BoilerActivityData> {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBoilerDto: BoilerActivityData) {
    return this.service.update(+id, updateBoilerDto);
  }

  @Override()
  async deleteOne(
    @ParsedRequest() req: CrudRequest,
  ) {
    return await this.service.remove(req)
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.service.remove(+id);
  // }
}
