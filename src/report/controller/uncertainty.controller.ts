import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudController} from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Uncertainty } from '../entities/uncertainty.entity';
import { UncertaintyService } from '../service/uncertainty.service';

@Crud({
  model: {
    type: Uncertainty,
  },
  query: {
    join: {
      emissionSource: {
        eager: true
      },
      report: {
        eager: true
      }
    },
  },
})
@UseGuards(JwtAuthGuard)
@Controller('uncertainty')
export class UncertaintyController implements CrudController<Uncertainty>{

  constructor(
    public service: UncertaintyService,
    private readonly reportHistoryService: UncertaintyService) {}

    get base(): CrudController<Uncertainty> {
      return this;
    }

}
