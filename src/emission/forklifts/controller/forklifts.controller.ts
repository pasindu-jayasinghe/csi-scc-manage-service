import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ForkliftsService } from '../service/forklifts.service';
import { Crud, CrudController } from '@nestjsx/crud';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForkliftsActivityData } from '../entities/forklift.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


@Crud({
  model: {
    type: ForkliftsActivityData,
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
@Controller('forklifts')
export class ForkliftsActivityDataController implements CrudController<ForkliftsActivityData>{
  constructor(
    public service: ForkliftsService,
    @InjectRepository(ForkliftsActivityData)
    private readonly forkliftRepository: Repository<ForkliftsActivityData>,
    ) {}

    get base(): CrudController<ForkliftsActivityData> {
      return this;
    }

  @Post()
  create(@Body() createForkliftDto: ForkliftsActivityData): Promise<ForkliftsActivityData>  {
    return this.service.create(createForkliftDto);
  }

  // @Get()
  // findAll() {
  //   return this.service.findAll();
  // }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ForkliftsActivityData> {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateForkliftDto: ForkliftsActivityData) {
    return this.service.update(+id, updateForkliftDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.service.remove(+id);
  // }
}
