import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FireExtinguisherService } from '../service/fire-extinguisher.service';
import { FireExtinguisherActivityData } from '../entities/fire-extinguisher.entity';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';


@Crud({
  model: {
    type: FireExtinguisherActivityData,
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
@Controller('fire-extinguisher')
export class FireExtinguisherActivityDataController implements CrudController<FireExtinguisherActivityData>{
  constructor(public service: FireExtinguisherService,
 ) {}


  get base(): CrudController<FireExtinguisherActivityData> {
    return this;
  }
  @Post()
  create(@Body() createFireExtinguisherDto: FireExtinguisherActivityData):Promise<FireExtinguisherActivityData> {
    return this.service.create(createFireExtinguisherDto);
  }

  // @Get()
  // async findAll():Promise<FireExtinguisher[]> {
  //   console.log("work")
  //   return await this.service.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string):Promise<FireExtinguisher> {
  //   return this.service.findOne(+id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() FireExtinguisher: FireExtinguisherActivityData) {
    return this.service.update(+id, FireExtinguisher);
  }

  @Override()
  async deleteOne(
    @ParsedRequest() req: CrudRequest,
  ) {
    return await this.service.remove(req)
  }
}
