import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CookingGasService } from '../service/cooking-gas.service';
import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm-next';
import { CookingGasActivityData } from '../entities/cooking-gas.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: CookingGasActivityData,
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
@Controller('cooking-gas')
export class CookingGasActivityDataController implements CrudController<CookingGasActivityData>{
  constructor(
    public service: CookingGasService,
    @InjectRepository(CookingGasActivityData)
    private readonly cookingGasRepository: Repository<CookingGasActivityData>,
    ) {}

    get base(): CrudController<CookingGasActivityData> {
      return this;
    }

  @Post()
  create(@Body() createCookingGasDto: CookingGasActivityData): Promise<CookingGasActivityData> {
    return this.service.create(createCookingGasDto);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCookingGasDto: CookingGasActivityData) {
    return this.service.update(+id, updateCookingGasDto);
  }


 @Override()
 async deleteOne(
   @ParsedRequest() req: CrudRequest,
 ) {
   return await this.service.remove(req)
 }


}
