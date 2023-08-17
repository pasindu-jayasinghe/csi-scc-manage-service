import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';

import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PrevEmission } from '../entities/prev-emission.entity';
import { PrevEmissionService } from '../service/prev-emission.service';


@Crud({
  model: {
    type: PrevEmission,
  },
  query: {
    join: {
      projectType: {eager: true},
      unit: {eager: true},
      emissionSource: {eager: true}
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('prev-emission')
export class PrevEmissionController implements CrudController<PrevEmission>{
  constructor(public service: PrevEmissionService) {}




  

}
