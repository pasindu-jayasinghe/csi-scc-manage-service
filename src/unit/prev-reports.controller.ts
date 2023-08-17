import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Crud, CrudController } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PrevReport } from './entities/prev-report.entity';
import { PrevReportsService } from './prev-reports.service';


@Crud({
  model: {
    type: PrevReport,
  },
  query: {
    join: {
      unitDetail: {
        eager: true
      },
      document: {
        eager: true
      }
    }
  },
})
@UseGuards(JwtAuthGuard)
@Controller('prev-reports')
export class PrevReportsController  implements CrudController<PrevReport>{

  constructor(public service: PrevReportsService) {}

  get base(): CrudController<PrevReport> {
    return this;
  }
  
}
