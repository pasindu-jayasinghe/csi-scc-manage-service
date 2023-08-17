import { Controller, UseGuards } from '@nestjs/common';

import { Crud, CrudController } from '@nestjsx/crud';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Industry } from './entities/industry.entity';
import { IndustryService } from './industry.service';


@Crud({
  model: {
    type: Industry,
  },
  query: {
    join: {
    
    },
  },
})

@UseGuards(JwtAuthGuard)
@Controller('industry')
export class IndustryController implements CrudController<Industry>{
  constructor(public service: IndustryService) {}




  

}
