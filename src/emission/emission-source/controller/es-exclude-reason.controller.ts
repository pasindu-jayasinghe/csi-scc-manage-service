import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EsExcludeReason } from '../entities/es-exclude-reason.entity';
import { EsExcludeReasonService } from '../service/es-exclude-reason.service';

@Crud({
  model: {
    type: EsExcludeReason,
  },
  query: {
    join: {
      emissionSource: {eager: true},
      report: {eager: true} 
    }
  },
})
@UseGuards(JwtAuthGuard)
@Controller('es-exclude-reason')
export class EsExcludeReasonController implements CrudController<EsExcludeReason>{
  
  constructor(public service: EsExcludeReasonService) {}

  get base(): CrudController<EsExcludeReason> {
    return this;
  }
}
