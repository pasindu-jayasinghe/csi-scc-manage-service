import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Crud, CrudController } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Repository } from 'typeorm';
import { Recomendation } from '../entities/recomendation.entity';
import { RecomendationService } from '../service/recomendation.service';

@Crud({
  model: {
    type: Recomendation,
  },
  query: {
    join: {
            
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('recomendation')
export class RecomendationController implements CrudController<Recomendation>{
  constructor(
    public service:RecomendationService,
    @InjectRepository(Recomendation)
    private readonly recomendationRepository: Repository<Recomendation>
    ) {}

    get base(): CrudController<Recomendation> {
      return this;
    }

  @Post()
  create(@Body() createRecomendationDto: Recomendation):Promise<Recomendation> {
    return this.service.create(createRecomendationDto);
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
  update(@Param('id') id: string, @Body() updateRecomendationDto: Recomendation) {
    return this.service.update(+id, updateRecomendationDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.service.remove(+id);
  // }
}
