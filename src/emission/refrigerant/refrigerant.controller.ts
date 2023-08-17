import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefrigerantActivityData } from './entities/refrigerant.entity';
import { RefrigerantService } from './service/refrigerant.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


@Crud({
  model: {
    type: RefrigerantActivityData,
  },
  query: {
    join: {
      project: {
        eager: true,
      },
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('refrigerant')
export class RefrigerantController implements CrudController<RefrigerantActivityData>{
  constructor(
    public service: RefrigerantService,
    @InjectRepository(RefrigerantActivityData)
    private readonly refrigerantRepository: Repository<RefrigerantActivityData>,
  ) {}

  get base(): CrudController<RefrigerantActivityData> {
    return this;
  }

  @Post()
  create(@Body() createRefrigerantDto: RefrigerantActivityData):Promise<RefrigerantActivityData> {
    return this.service.create(createRefrigerantDto);
  }


  @Get(':id')
  findOne(@Param('id') id: string): Promise<RefrigerantActivityData> {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRefrigerantDto: RefrigerantActivityData) {
    return this.service.update(+id, updateRefrigerantDto);
  }

  @Put(':id')
  updates(@Param('id') id: string, @Body() updateRefrigerantDto: RefrigerantActivityData) {
    return this.service.update(+id, updateRefrigerantDto);
  }
 
}
