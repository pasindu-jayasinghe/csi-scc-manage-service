import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';

import { Crud, CrudController, CrudRequest, Override, ParsedRequest } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UnitDetailMessage } from '../entities/unit-detail-message.entity';
import { UnitDetailMessageService } from '../service/unit-detail-message.service';


@Crud({
  model: {
    type: UnitDetailMessage,
  },
  query: {
    join: {
      unit: {eager: true},
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('unit-detail-message')
export class UnitDetailMessageController implements CrudController<UnitDetailMessage>{
  
  constructor(public service: UnitDetailMessageService) {}




  

}
