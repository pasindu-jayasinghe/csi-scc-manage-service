import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController} from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ReportHistory } from '../entities/reportHistory.entity';
import { ReportHistoryService } from '../service/reportHistory.service';

@Crud({
  model: {
    type: ReportHistory,
  },
  query: {
    join: {
      unit: {
        eager: true
      },
      project: {
        eager: true
      }
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('report-history')
export class ReportHistoryController implements CrudController<ReportHistory>{

  constructor(
    public service: ReportHistoryService,
    private readonly reportHistoryService: ReportHistoryService) {}

    get base(): CrudController<ReportHistory> {
      return this;
    }

}
