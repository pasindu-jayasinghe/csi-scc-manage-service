import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EsDatasource } from '../entities/es-datasource.entity';
import { EsDatasourceService } from '../service/es-datasource.service';

@Crud({
  model: {
    type: EsDatasource,
  },
  query: {
    join: {
      emissionSource: {eager: true},
      report: {eager: true},
      hiredCategory: {eager: true},
      rentedCategory: {eager: true},
      ownCategory: {eager: true},
      noneCategory: {eager: true},
    }
  },
})
@UseGuards(JwtAuthGuard)
@Controller('es-datasource')
export class EsDatasourceController implements CrudController<EsDatasource>{
  constructor(public service: EsDatasourceService) {}

  get base(): CrudController<EsDatasource> {
    return this;
  }
}
