import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EmissionCategoryService } from '../service/emission-category.service';
import { CreateEmissionCategoryDto } from '../dto/create-emission-category.dto';
import { EmissionCategory } from '../entities/emission-category.entity';
import { Crud, CrudController } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Crud({
  model: {
    type: EmissionCategory,
  },
  query: {
    join: {
      emissionSource: {eager: true},
      report: {eager: true} 
    }
  },
})
@UseGuards(JwtAuthGuard)
@Controller('emission-category')
export class EmissionCategoryController implements CrudController<EmissionCategory> {
  constructor(public service: EmissionCategoryService) {}

  get base(): CrudController<EmissionCategory> {
    return this;
  }

}
